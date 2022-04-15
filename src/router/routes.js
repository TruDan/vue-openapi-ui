import { RouterView } from 'vue-router'
import MainLayout from 'layouts/MainLayout'
import SpecLayout from 'layouts/SpecLayout'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: ':spec',
        component: SpecLayout,
        children: [
          {
            name: 'view-spec',
            path: '',
            component: () => import('pages/spec/IndexPage.vue'),
          },
          {
            name: 'view-operation',
            path: ':operation/:path(.*)*',
            component: () => import('pages/spec/PathOperationPage.vue'),
          }
        ]
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
