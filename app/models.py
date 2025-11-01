from pydantic import BaseModel
from typing import List, Optional, Literal


class TextMessage(BaseModel):
    type: Literal["text"]
    text: str
    timestamp: Optional[float] = None


class Fallacy(BaseModel):
    type: str  # e.g., "ad_hominem", "strawman", "false_dilemma", etc.
    name: str  # Human-readable name
    severity: Literal["low", "medium", "high"]  # Severity level
    confidence: float  # 0.0 to 1.0
    explanation: str  # Why this fallacy was detected
    text_span: str  # The specific text segment containing the fallacy
    start_index: Optional[int] = None
    end_index: Optional[int] = None


class FallacyDetectionResult(BaseModel):
    has_fallacies: bool
    fallacies: List[Fallacy]
    confidence: float  # Overall confidence in the detection
    analysis: Optional[str] = None  # Overall analysis of the text


class PingMessage(BaseModel):
    type: Literal["ping"]

