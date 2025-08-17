export type MatrixEvent = {
    type: string;
    event_id: string;
    content: any;
    sender: string;
    origin_server_ts: number;
    room_id: string;
    prevEvent?: any;
};