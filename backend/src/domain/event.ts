export interface Event {
    id: string;
    owner_id: string;
    page_id?: string;
    title: string;
    description?: string;
    start_time: Date;
    end_time: Date;
    all_day: boolean;
    color: string;
    created_at: Date;
    updated_at: Date;
}

export interface EventCreateInput {
    title: string;
    description?: string;
    page_id?: string;
    start_time: string;
    end_time: string;
    all_day?: boolean;
    color?: string;
}
