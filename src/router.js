import { render } from './render.js';

export let routes = [];

const registerRoute = (route, mountTo, errorComponent) => {
  const { path, component } = route;
  routes.push({ path, component, mountTo, errorComponent: route.errorComponent ?? errorComponent });
};

export const Routes = (data) => {
  const { children, mountTo, errorComponent } = data;
  children.forEach((child) => registerRoute(child, mountTo, errorComponent));
  return;
};

export const Route = (data) => data;

const navigate = (pathname) => (routes
  .find((route) => {
    if (route.path === '*') return false;
    const pattern = route.path.replace(/:[^/]+/g, '([^/]+)') + '/?$';
    const regex = new RegExp('^' + pattern);
    return regex.test(pathname);
  }) ?? routes.find((route) => route.path === '*'));

export const mountRoute = async () => {
  const href = (window.location.href).replace(/\/+$/, '');
  if (window.location.href.at(-1) === '/') history.replaceState({}, '', href);
  const { pathname } = new URL(href);
  const route = navigate(pathname);
  if (!route) throw new Error(`No route matches "${pathname}". Add a Route with path="*" for a not-found page.`);
  const { component, mountTo, errorComponent } = route;
  try {
    await render(mountTo, await component());
  } catch (error) {
    if (!errorComponent) throw error;
    await render(mountTo, await errorComponent({ error }));
  }
};

export const navigateBack = () => {
  history.back();
};

export const redirect = (route) => {
  history.pushState({}, '', `${route}`);
  return mountRoute();
};

export const refreshPage = () => {
  const currentUrl = window.location.href;
  history.replaceState({}, '', currentUrl);
  return mountRoute();
};

window.addEventListener('popstate', () => mountRoute());
