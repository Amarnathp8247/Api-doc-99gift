import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginSectionComponent } from './pages/login-section/login-section.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { OrderPlaceComponent } from './pages/order-place/order-place.component';
import { OrderReportComponent } from './pages/order-report/order-report.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { VoucherDetailsComponent } from './pages/voucher-details/voucher-details.component';
import { VoucherStatusComponent } from './pages/voucher-status/voucher-status.component';
import { WalletStatementComponent } from './pages/wallet-statement/wallet-statement.component';
import { ProductSearchComponent } from './pages/product-search/product-search.component';

export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
    },

    {
        path: 'login-api',
        component: LoginSectionComponent,
    },
    {
        path: 'product-list-api',
        component: ProductListComponent,
    },
    {
        path: 'product-search-api',
        component: ProductSearchComponent,
    },
    {
        path: 'product-details-api',
        component: ProductDetailsComponent,
    },
    {
        path: 'order-place-api',
        component: OrderPlaceComponent,
    },
    {
        path: 'order-report-api',
        component: OrderReportComponent,
    },
    {
        path: 'profile-api',
        component: ProfileComponent,
    },
    {
        path: 'voucher-details-api',
        component: VoucherDetailsComponent,
    },
    {
        path: 'voucher-status-api',
        component: VoucherStatusComponent,
    },
    {
        path: 'wallet-statement-api',
        component: WalletStatementComponent,
    },
];
