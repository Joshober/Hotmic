import os
import json
import httpx
from typing import Dict, List, Any
from app.models import Fallacy, FallacyDetectionResult

class FallacyDetector:
    def __init__(self):
        # Support for local models via Ollama or other local API endpoints
        self.api_base = os.getenv("LOCAL_API_BASE", "http://localhost:11434")
        self.model_name = os.getenv("LOCAL_MODEL_NAME", "llama3.2")
        self.use_ollama = os.getenv("USE_OLLAMA", "true").lower() == "true"
        self.fallacy_types = {
            "ad_hominem": "Attacking the person instead of their argument",
            "strawman": "Misrepresenting someone's argument to make it easier to attack",
            "false_dilemma": "Presenting two options when more exist",
            "appeal_to_emotion": "Using emotion to persuade rather than logic",
            "slippery_slope": "Claiming one event will inevitably lead to another",
            "false_cause": "Assuming causation from correlation",
            "hasty_generalization": "Making broad conclusions from limited evidence",
            "appeal_to_authority": "Using authority as evidence when it's not relevant",
            "bandwagon": "Assuming something is true because many people believe it",
            "circular_reasoning": "Using a conclusion as evidence for itself",
            "red_herring": "Diverting attention from the main issue",
            "factual_error": "Stating incorrect factual information",
            "misleading_statistic": "Using statistics in a misleading way",
            "equivocation": "Using ambiguous language to mislead"
        }
    
    async def detect_fallacies(self, text: str) -> Dict[str, Any]:
        """Detect fallacies in the given text using local model API"""
        if not text or len(text.strip()) < 10:
            return {
                "has_fallacies": False,
                "fallacies": [],
                "confidence": 0.0
            }
        
        try:
            # Create prompt for fallacy detection
            system_prompt = """You are an expert at detecting logical fallacies and factual errors in text. 
Analyze the following text and identify any fallacies or factual inaccuracies. 
For each fallacy found, provide:
- The type of fallacy (use the exact names from: ad_hominem, strawman, false_dilemma, appeal_to_emotion, slippery_slope, false_cause, hasty_generalization, appeal_to_authority, bandwagon, circular_reasoning, red_herring, factual_error, misleading_statistic, equivocation)
- A human-readable name for the fallacy
- Severity (low, medium, or high)
- Confidence (0.0 to 1.0)
- An explanation of why this is a fallacy
- The exact text span where the fallacy occurs
- Start and end character indices

If no fallacies are found, return an empty list. Be thorough but fair - only flag clear fallacies.
IMPORTANT: You must respond ONLY with valid JSON, no other text."""

            user_prompt = f"""Analyze this text for fallacies and factual errors:\n\n{text}\n\nRespond in JSON format with this structure:
{{
    "has_fallacies": true/false,
    "fallacies": [
        {{
            "type": "fallacy_type",
            "name": "Human readable name",
            "severity": "low|medium|high",
            "confidence": 0.0-1.0,
            "explanation": "Explanation of the fallacy",
            "text_span": "Exact text containing the fallacy",
            "start_index": 0,
            "end_index": 10
        }}
    ],
    "confidence": 0.0-1.0,
    "analysis": "Brief overall analysis"
}}"""

            if self.use_ollama:
                # Use Ollama API
                try:
                    async with httpx.AsyncClient(timeout=60.0) as client:
                        response = await client.post(
                            f"{self.api_base}/api/chat",
                            json={
                                "model": self.model_name,
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": user_prompt}
                                ],
                                "stream": False,
                                "options": {
                                    "temperature": 0.3,
                                }
                            }
                        )
                        response.raise_for_status()
                        result_data = response.json()
                        result_text = result_data.get("message", {}).get("content", "")
                except httpx.ConnectError:
                    raise Exception(f"Could not connect to Ollama at {self.api_base}. Is Ollama running?")
                except httpx.HTTPStatusError as e:
                    raise Exception(f"Ollama API error: {e.response.status_code} - {e.response.text}")
                except Exception as e:
                    raise Exception(f"Error calling Ollama: {str(e)}")
            else:
                # Use OpenAI-compatible API endpoint
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self.api_base}/v1/chat/completions",
                        json={
                            "model": self.model_name,
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.3,
                            "response_format": {"type": "json_object"}
                        }
                    )
                    response.raise_for_status()
                    result_data = response.json()
                    result_text = result_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Handle empty response
            if not result_text or not result_text.strip():
                raise Exception("Empty response from model. Ollama may not be running or the model may not be available.")
            
            # Clean up the response - remove markdown code blocks if present
            result_text = result_text.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            elif result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            # Try to parse JSON
            try:
                detection_result = json.loads(result_text)
            except json.JSONDecodeError as e:
                raise Exception(f"Invalid JSON response from model: {str(e)}. Response: {result_text[:200]}")
            
            # Parse and structure the results
            fallacies = []
            for fallacy_data in detection_result.get("fallacies", []):
                # Safely convert confidence to float
                confidence_val = fallacy_data.get("confidence", 0.0)
                try:
                    confidence = float(confidence_val) if confidence_val != "" and confidence_val is not None else 0.0
                except (ValueError, TypeError):
                    confidence = 0.0
                
                fallacy = Fallacy(
                    type=fallacy_data.get("type", "unknown"),
                    name=fallacy_data.get("name", "Unknown Fallacy"),
                    severity=fallacy_data.get("severity", "low"),
                    confidence=confidence,
                    explanation=fallacy_data.get("explanation", ""),
                    text_span=fallacy_data.get("text_span", ""),
                    start_index=fallacy_data.get("start_index"),
                    end_index=fallacy_data.get("end_index")
                )
                fallacies.append(fallacy)
            
            # Safely convert overall confidence to float
            overall_confidence_val = detection_result.get("confidence", 0.0)
            try:
                overall_confidence = float(overall_confidence_val) if overall_confidence_val != "" and overall_confidence_val is not None else 0.0
            except (ValueError, TypeError):
                overall_confidence = 0.0
            
            return {
                "has_fallacies": detection_result.get("has_fallacies", False),
                "fallacies": fallacies,
                "confidence": overall_confidence,
                "analysis": detection_result.get("analysis", "")
            }
            
        except Exception as e:
            print(f"Error detecting fallacies: {e}")
            # Return empty result on error
            return {
                "has_fallacies": False,
                "fallacies": [],
                "confidence": 0.0,
                "error": str(e)
            }

