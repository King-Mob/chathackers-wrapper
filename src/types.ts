export type MatrixEvent = {
    type: string;
    event_id: string;
    content: any;
    sender: string;
    origin_server_ts: number;
    room_id: string;
    prevEvent?: any;
};

export type ChatModule = {
    id: string;
    url: string;
    emoji: string;
    wake_word: string;
    title: string;
    description: string;
    event_types: string[];
}