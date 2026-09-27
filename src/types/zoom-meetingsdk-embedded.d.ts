declare module "@zoom/meetingsdk/embedded.js" {
  export interface ZoomEmbeddedClient {
    init(options: {
      zoomAppRoot: HTMLElement;
      language?: string;
      customize?: {
        meetingInfo?: string[];
        toolbar?: {
          buttons?: Array<{
            text: string;
            className?: string;
            onClick: () => void;
          }>;
        };
      };
    }): Promise<unknown>;
    join(options: {
      sdkKey: string;
      signature: string;
      meetingNumber: string;
      password?: string;
      userName: string;
      userEmail?: string;
      customerKey?: string;
    }): Promise<unknown>;
    leaveMeeting(): Promise<unknown>;
    on(event: string, callback: (payload: Record<string, unknown>) => void): void;
    off(event: string, callback: (payload: Record<string, unknown>) => void): void;
  }

  export interface ZoomMtgEmbeddedStatic {
    createClient(): ZoomEmbeddedClient;
    destroyClient(): void;
  }

  const ZoomMtgEmbedded: ZoomMtgEmbeddedStatic;
  export default ZoomMtgEmbedded;
}

declare module "@zoom/meetingsdk/embedded" {
  import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded.js";
  export default ZoomMtgEmbedded;
}
