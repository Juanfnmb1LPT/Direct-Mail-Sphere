import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import HouseMapView from '../views/HouseMapView.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignupView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/create-mail', name: 'create-mail', component: HouseMapView }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
