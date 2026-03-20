// 1. Interfaz para tipar tus datos
export interface CompanySettingInterface {
    cmp_uuid: string,
    cmps_uuid: string,
    cmps_key: string,
    cmps_parameter: string,
    cmps_description: string,
    cmps_value: string,
    cmps_datatype: string,
    cmps_options: string,
    cmps_group: string,
    cmps_createdat: Date,
    cmps_updatedat: Date
}