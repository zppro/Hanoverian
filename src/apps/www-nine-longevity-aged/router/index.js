/**
 * Created by zppro on 17-7-19.
 */
import Vue from 'vue'
import Router from 'vue-router'
import routeConfigTPA from './TPA'
import routeConfigTNM from './TNM'
import routeConfigJob from './job'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    scrollBehavior: () => ({y: 0}),
    routes: [
      {path: '/index', component: createIndexView()},
      {path: '/login', component: createLoginView()},
      {path: '/join/:type(\\d+)?', component: createJoinView()},
      {path: '/ask/:page(\\d+)?', component: createListView('ask')},
      {path: '/job/:page(\\d+)?', component: createListView('job')},
      {path: '/item/:id(\\d+)', component: ItemView},
      {path: '/user/:id', component: UserView},
      {path: '/', redirect: '/index'},
      ...routeConfigTPA,
      ...routeConfigTNM,
      ...routeConfigJob
    ]
  })
}