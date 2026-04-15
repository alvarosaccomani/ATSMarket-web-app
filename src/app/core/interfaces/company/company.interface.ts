// 1. Interfaz para tipar tus datos
export interface CompanyInterface {
    cmp_uuid: string,
    cmp_name: string,
    cmp_address: string,
    cmp_lat: number,
    cmp_lng: number,
    cmp_phone: string,
    cmp_email: string,
    cmp_slug: string,
    cmp_logo: string,
    cmp_banner: string,
    cmp_description: string,
    cmp_currency: string,
    cmp_whatsapp: string,
    cmp_instagram: string,
    cmp_facebook: string,
    cmp_allowbackorders: boolean,
    cmp_primarycolor: string,
    cmp_isfeatured: boolean,
    cmp_status: string,  //-- active, inactive, pending
    cmp_createdat: Date,
    cmp_updatedat: Date
}