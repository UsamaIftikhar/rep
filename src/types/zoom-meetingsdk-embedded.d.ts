declare module "@zoom/meetingsdk/embedded" {
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
    }): Promise<any>;
    join(options: {
      sdkKey: string;
      signature: string;
      meetingNumber: string;
      password?: string;
      userName: string;
      userEmail?: string;
      customerKey?: string;
    }): Promise<any>;
    leaveMeeting(): Promise<any>;
  }

  export interface ZoomMtgEmbeddedStatic {
    createClient(): ZoomEmbeddedClient;
    destroyClient(): void;
  }

  const ZoomMtgEmbedded: ZoomMtgEmbeddedStatic;
  export default ZoomMtgEmbedded;
}
