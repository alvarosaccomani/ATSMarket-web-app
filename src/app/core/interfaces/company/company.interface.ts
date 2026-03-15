// 1. Interfaz para tipar tus datos
export interface CompanyInterface {
    cmp_uuid: string,
    cmp_name: string,
    cmp_address: string,
    cmp_phone: string,
    cmp_email: string,
    cmp_slug: string
    cmp_logo: string
    cmp_banner: string
    cmp_description: string
    cmp_isfeatured: boolean,
    cmp_status: string,  //-- active, inactive, pending
    cmp_createdat: Date,
    cmp_updatedat: Date
}