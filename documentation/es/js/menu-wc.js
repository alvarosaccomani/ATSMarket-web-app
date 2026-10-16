'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">ATSMarket Web App</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Escribe para buscar">
    <button type="button"
        class="search-input-clear"
        aria-label="Clear search"
        data-search-input-clear>&times;</button>
</div>
` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Comenzando</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Descripción general
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        Léeme
                                </a>
                            </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="architecture.html" data-type="chapter-link">
                                        <span class="icon ion-ios-git-branch"></span>Arquitectura
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencias
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Propiedades
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter additional">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#additional-pages"'
                            : 'data-bs-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Additional documentation</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="link ">
                                        <a href="additional-documentation/01.-introducción-y-arquitectura-general.html" data-type="entity-link" data-context-id="additional">01. Introducción y Arquitectura General</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/02.-autenticación-y-control-de-accesos.html" data-type="entity-link" data-context-id="additional">02. Autenticación y Control de Accesos</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/03.-catálogo-público-y-exploración-de-tiendas.html" data-type="entity-link" data-context-id="additional">03. Catálogo Público y Exploración de Tiendas</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/04.-carrito-de-compras-y-checkout-multitienda.html" data-type="entity-link" data-context-id="additional">04. Carrito de Compras y Checkout Multitienda</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/05.-gestión-de-empresas,-roles-y-configuración.html" data-type="entity-link" data-context-id="additional">05. Gestión de Empresas, Roles y Configuración</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/06.-inventario,-productos,-variaciones-y-almacenes.html" data-type="entity-link" data-context-id="additional">06. Inventario, Productos, Variaciones y Almacenes</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/07.-gestión-de-pedidos,-compras-y-cupones.html" data-type="entity-link" data-context-id="additional">07. Gestión de Pedidos, Compras y Cupones</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/08.-analíticas-de-negocio,-finanzas-y-proveedores.html" data-type="entity-link" data-context-id="additional">08. Analíticas de Negocio, Finanzas y Proveedores</a>
                                    </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Componentes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AccountConfirmedComponent.html" data-type="entity-link" >AccountConfirmedComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccountCreatedComponent.html" data-type="entity-link" >AccountCreatedComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AddressesComponent.html" data-type="entity-link" >AddressesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AnalyticsComponent.html" data-type="entity-link" >AnalyticsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ApplicationBarComponent.html" data-type="entity-link" >ApplicationBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ApplicationLayoutComponent.html" data-type="entity-link" >ApplicationLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuthLayoutComponent.html" data-type="entity-link" >AuthLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BarcodeScannerComponent.html" data-type="entity-link" >BarcodeScannerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CameraComponent.html" data-type="entity-link" >CameraComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CartComponent.html" data-type="entity-link" >CartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CatalogComponent.html" data-type="entity-link" >CatalogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CategoriesComponent.html" data-type="entity-link" >CategoriesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CategoriesListComponent.html" data-type="entity-link" >CategoriesListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CheckoutComponent.html" data-type="entity-link" >CheckoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanyComponent.html" data-type="entity-link" >CompanyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanySettingsComponent.html" data-type="entity-link" >CompanySettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CouponsComponent.html" data-type="entity-link" >CouponsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CustomersComponent.html" data-type="entity-link" >CustomersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DistPriceListComponent.html" data-type="entity-link" >DistPriceListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FinancesComponent.html" data-type="entity-link" >FinancesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ForgotPasswordComponent.html" data-type="entity-link" >ForgotPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlobalCategoriesComponent.html" data-type="entity-link" >GlobalCategoriesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlobalCategoryComponent.html" data-type="entity-link" >GlobalCategoryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlobalItemComponent.html" data-type="entity-link" >GlobalItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlobalItemsComponent.html" data-type="entity-link" >GlobalItemsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlobalMaterialComponent.html" data-type="entity-link" >GlobalMaterialComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlobalMaterialsComponent.html" data-type="entity-link" >GlobalMaterialsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HomeStoreComponent.html" data-type="entity-link" >HomeStoreComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InventoryAuditComponent.html" data-type="entity-link" >InventoryAuditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ItemsComponent.html" data-type="entity-link" >ItemsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MapPickerComponent.html" data-type="entity-link" >MapPickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MarketHomeComponent.html" data-type="entity-link" >MarketHomeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaterialComponent.html" data-type="entity-link" >MaterialComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaterialsComponent.html" data-type="entity-link" >MaterialsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MenuItemComponent.html" data-type="entity-link" >MenuItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MenuItemsComponent.html" data-type="entity-link" >MenuItemsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MpPaymentBrickComponent.html" data-type="entity-link" >MpPaymentBrickComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MyCompaniesComponent.html" data-type="entity-link" >MyCompaniesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MyFavoritesComponent.html" data-type="entity-link" >MyFavoritesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MyPurchasesComponent.html" data-type="entity-link" >MyPurchasesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavBarComponent.html" data-type="entity-link" >NavBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrdersReceivedComponent.html" data-type="entity-link" >OrdersReceivedComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PriceListComponent.html" data-type="entity-link" >PriceListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductComponent.html" data-type="entity-link" >ProductComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductDetailComponent.html" data-type="entity-link" >ProductDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductsComponent.html" data-type="entity-link" >ProductsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductsVariationsComponent.html" data-type="entity-link" >ProductsVariationsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProductVariationComponent.html" data-type="entity-link" >ProductVariationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PublicLayoutComponent.html" data-type="entity-link" >PublicLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SideBarComponent.html" data-type="entity-link" >SideBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SsoCallbackComponent.html" data-type="entity-link" >SsoCallbackComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StoreCatalogComponent.html" data-type="entity-link" >StoreCatalogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SuperAdminComponent.html" data-type="entity-link" >SuperAdminComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SupplierComponent.html" data-type="entity-link" >SupplierComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SuppliersComponent.html" data-type="entity-link" >SuppliersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserLayoutComponent.html" data-type="entity-link" >UserLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserRolCompanyComponent.html" data-type="entity-link" >UserRolCompanyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WarehousesComponent.html" data-type="entity-link" >WarehousesComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directivas</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/ImagePreloadDirective.html" data-type="entity-link" >ImagePreloadDirective</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Inyectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AddressesService.html" data-type="entity-link" >AddressesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AnalyticsService.html" data-type="entity-link" >AnalyticsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppMenusService.html" data-type="entity-link" >AppMenusService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartService.html" data-type="entity-link" >CartService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CategoriesService.html" data-type="entity-link" >CategoriesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChatService.html" data-type="entity-link" >ChatService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompaniesService.html" data-type="entity-link" >CompaniesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompaniesSettingsService.html" data-type="entity-link" >CompaniesSettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CouponsService.html" data-type="entity-link" >CouponsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CurrenciesService.html" data-type="entity-link" >CurrenciesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomersService.html" data-type="entity-link" >CustomersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FavoritesService.html" data-type="entity-link" >FavoritesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GeocoderService.html" data-type="entity-link" >GeocoderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GlobalCategoriesService.html" data-type="entity-link" >GlobalCategoriesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GlobalItemsService.html" data-type="entity-link" >GlobalItemsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GlobalMaterialsService.html" data-type="entity-link" >GlobalMaterialsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InventoryStocksService.html" data-type="entity-link" >InventoryStocksService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ItemsService.html" data-type="entity-link" >ItemsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MaterialsService.html" data-type="entity-link" >MaterialsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MercadopagoService.html" data-type="entity-link" >MercadopagoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link" >MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationsService.html" data-type="entity-link" >NotificationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersHistoryService.html" data-type="entity-link" >OrdersHistoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersService.html" data-type="entity-link" >OrdersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductsService.html" data-type="entity-link" >ProductsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductVariationReviewsService.html" data-type="entity-link" >ProductVariationReviewsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductVariationsService.html" data-type="entity-link" >ProductVariationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesService.html" data-type="entity-link" >RolesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SessionService.html" data-type="entity-link" >SessionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StockMovementsService.html" data-type="entity-link" >StockMovementsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StoreContextService.html" data-type="entity-link" >StoreContextService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SuppliersService.html" data-type="entity-link" >SuppliersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserRolesCompanyService.html" data-type="entity-link" >UserRolesCompanyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WarehousesLocationsService.html" data-type="entity-link" >WarehousesLocationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WarehousesService.html" data-type="entity-link" >WarehousesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WebSocketNotificationService.html" data-type="entity-link" >WebSocketNotificationService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guardias</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/authGuard.html" data-type="entity-link" >authGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/merchantGuard.html" data-type="entity-link" >merchantGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/roleGuard.html" data-type="entity-link" >roleGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/superAdminGuard.html" data-type="entity-link" >superAdminGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/unauthGuard.html" data-type="entity-link" >unauthGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AddressInterface.html" data-type="entity-link" >AddressInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AddressResults.html" data-type="entity-link" >AddressResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartItemInterface.html" data-type="entity-link" >CartItemInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryGroup.html" data-type="entity-link" >CategoryGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryInterface.html" data-type="entity-link" >CategoryInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryInterface-1.html" data-type="entity-link" >CategoryInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryPerformance.html" data-type="entity-link" >CategoryPerformance</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryResults.html" data-type="entity-link" >CategoryResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyInterface.html" data-type="entity-link" >CompanyInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyResults.html" data-type="entity-link" >CompanyResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanySettingInterface.html" data-type="entity-link" >CompanySettingInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanySettingResults.html" data-type="entity-link" >CompanySettingResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CurrencyInterface.html" data-type="entity-link" >CurrencyInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CurrencyResults.html" data-type="entity-link" >CurrencyResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomerInterface.html" data-type="entity-link" >CustomerInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomerOrder.html" data-type="entity-link" >CustomerOrder</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomerResults.html" data-type="entity-link" >CustomerResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CustomerViewModel.html" data-type="entity-link" >CustomerViewModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Favorite.html" data-type="entity-link" >Favorite</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FullAddress.html" data-type="entity-link" >FullAddress</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GeocodingResult.html" data-type="entity-link" >GeocodingResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalCategoryInterface.html" data-type="entity-link" >GlobalCategoryInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalCategoryResults.html" data-type="entity-link" >GlobalCategoryResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalItemInterface.html" data-type="entity-link" >GlobalItemInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalItemResults.html" data-type="entity-link" >GlobalItemResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalMaterialInterface.html" data-type="entity-link" >GlobalMaterialInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GlobalMaterialResults.html" data-type="entity-link" >GlobalMaterialResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryStockInterface.html" data-type="entity-link" >InventoryStockInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryStockResults.html" data-type="entity-link" >InventoryStockResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemInterface.html" data-type="entity-link" >ItemInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemResults.html" data-type="entity-link" >ItemResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaterialInterface.html" data-type="entity-link" >MaterialInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaterialResults.html" data-type="entity-link" >MaterialResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuInterface.html" data-type="entity-link" >MenuInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuResults.html" data-type="entity-link" >MenuResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessageConfig.html" data-type="entity-link" >MessageConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessageInterface.html" data-type="entity-link" >MessageInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessageResults.html" data-type="entity-link" >MessageResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NominatimResult.html" data-type="entity-link" >NominatimResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationInterface.html" data-type="entity-link" >NotificationInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationResults.html" data-type="entity-link" >NotificationResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderDetailInterface.html" data-type="entity-link" >OrderDetailInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderDetailResults.html" data-type="entity-link" >OrderDetailResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderHistoryInterface.html" data-type="entity-link" >OrderHistoryInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderHistoryResults.html" data-type="entity-link" >OrderHistoryResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderInterface.html" data-type="entity-link" >OrderInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderResults.html" data-type="entity-link" >OrderResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PayoutEvent.html" data-type="entity-link" >PayoutEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductInterface.html" data-type="entity-link" >ProductInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Producto.html" data-type="entity-link" >Producto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductResults.html" data-type="entity-link" >ProductResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductVariationInterface.html" data-type="entity-link" >ProductVariationInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductVariationResults.html" data-type="entity-link" >ProductVariationResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductVariationReviewInterface.html" data-type="entity-link" >ProductVariationReviewInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductVariationReviewResults.html" data-type="entity-link" >ProductVariationReviewResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RiderSettlementViewModel.html" data-type="entity-link" >RiderSettlementViewModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RolInterface.html" data-type="entity-link" >RolInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RolResults.html" data-type="entity-link" >RolResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SelectedLocation.html" data-type="entity-link" >SelectedLocation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SessionData.html" data-type="entity-link" >SessionData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StockMovementInterface.html" data-type="entity-link" >StockMovementInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StockMovementResults.html" data-type="entity-link" >StockMovementResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StoreOrderGroup.html" data-type="entity-link" >StoreOrderGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierInterface.html" data-type="entity-link" >SupplierInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SupplierResults.html" data-type="entity-link" >SupplierResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TopProduct.html" data-type="entity-link" >TopProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserInterface.html" data-type="entity-link" >UserInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserResults.html" data-type="entity-link" >UserResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRolCompanyInterface.html" data-type="entity-link" >UserRolCompanyInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRolCompanyResults.html" data-type="entity-link" >UserRolCompanyResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WarehouseInterface.html" data-type="entity-link" >WarehouseInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WarehouseLocationInterface.html" data-type="entity-link" >WarehouseLocationInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WarehouseLocationResults.html" data-type="entity-link" >WarehouseLocationResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WarehouseResults.html" data-type="entity-link" >WarehouseResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Window.html" data-type="entity-link" >Window</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscelánea</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Alias de tipo</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Rutas</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Cobertura de la documentación</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentación generada utilizando <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
