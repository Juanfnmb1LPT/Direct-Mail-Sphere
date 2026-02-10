import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import HouseMapView from '../views/HouseMapView.vue'
import CreateMailView from '../views/CreateMailView.vue'
import CreateMailTemplatesView from '../views/CreateMailTemplatesView.vue'
import UpdateProfileView from '../views/UpdateProfileView.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignupView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/profile', name: 'profile', component: UpdateProfileView },
    { path: '/create-mail', name: 'create-mail', component: CreateMailTemplatesView },
    { path: '/create-mail/form', name: 'create-mail-form', component: CreateMailView },
    { path: '/map-test', name: 'map-test', component: HouseMapView }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
