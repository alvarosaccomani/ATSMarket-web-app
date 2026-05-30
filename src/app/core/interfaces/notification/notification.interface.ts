export interface NotificationInterface {
    usr_uuid: string;
    cus_uuid: string;
    ntf_uuid: string;
    cmp_uuid?: string;
    ntf_title: string;
    ntf_message: string;
    ntf_type: 'success' | 'info' | 'warning' | 'error';
    ntf_isread: boolean;
    ntf_actionurl?: string;
    ntf_createdat: Date | string;
}
