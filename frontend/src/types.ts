export interface Fallacy {
  type: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  explanation: string;
  text_span: string;
  start_index?: number;
  end_index?: number;
  speaker?: string;
}

export interface FallacyDetection {
  type: string;
  text: string;
  fallacies: Fallacy[];
  has_fallacies: boolean;
  confidence: number;
  speaker?: string;
}

export interface FallacyStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
  };
  bySpeaker: Record<string, number>;
  speakerDetails: Record<string, {
    total: number;
    bySeverity: {
      low: number;
      medium: number;
      high: number;
    };
  }>;
}

