export interface MessageInterface {
    cmp_uuid: string;
    msg_uuid: string;
    ord_uuid: string;
    msg_sender: string;
    usr_uuid: string;
    cus_uuid: string | null;
    msg_sendername: string;
    msg_text: string;
    msg_createdat: Date;
    msg_updatedat: Date;
}