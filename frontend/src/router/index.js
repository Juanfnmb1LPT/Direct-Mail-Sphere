import { createRouter, createWebHistory } from 'vue-router'
import LandingPageView from '../views/LandingPageView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import HouseMapView from '../views/HouseMapView.vue'
import CreateMailView from '../views/CreateMailView.vue'
import CreateMailTemplatesView from '../views/CreateMailTemplatesView.vue'
import CreateMailPaymentView from '../views/CreateMailPaymentView.vue'
import UpdateProfileView from '../views/UpdateProfileView.vue'
import OrderHistoryView from '../views/OrderHistoryView.vue'
import UserListingsView from '../views/UserListingsView.vue'
import NikTestPageView from '../views/NikTestPageView.vue'
import JuansPageView from '../views/JuansPageView.vue'

const routes = [
    { path: '/', name: 'home', component: LandingPageView, meta: { title: 'Home' } },
    { path: '/login', name: 'login', component: LoginView, meta: { title: 'Login' } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { title: 'Sign Up' } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
    { path: '/profile', name: 'profile', component: UpdateProfileView, meta: { title: 'Update Profile' } },
    { path: '/orders', name: 'orders', component: OrderHistoryView, meta: { title: 'Order History' } },
    { path: '/listings', name: 'listings', component: UserListingsView, meta: { title: 'User Listings' } },
    { path: '/create-mail', name: 'create-mail', component: CreateMailTemplatesView, meta: { title: 'Create Mail Templates' } },
    { path: '/create-mail/form', name: 'create-mail-form', component: CreateMailView, meta: { title: 'Create Mail Form' } },
    { path: '/create-mail/payment', name: 'create-mail-payment', component: CreateMailPaymentView, meta: { title: 'Payment' } },
    { path: '/map-test', name: 'map-test', component: HouseMapView, meta: { title: 'House Map' } },
    { path: '/nik-test-page', name: 'nik-test-page', component: NikTestPageView, meta: {  title: 'Nik page'} },
    { path: '/juans-page', name: 'juans-page', component: JuansPageView, meta: { title: "Juan's Page" } }
  
]

const APP_TITLE = 'Direct Mail Sphere'

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.afterEach((to) => {
    const pageTitle = to.meta?.title
    document.title = pageTitle ? `${pageTitle} | ${APP_TITLE}` : APP_TITLE
})

export default router
