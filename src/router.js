import { render } from './render.js';

export let routes = [];

const registerRoute = (route, mountTo) => {
  const { path, component } = route;
  routes.push({ path, component, mountTo });
};

export const Routes = (data) => {
  const { children, mountTo } = data;
  children.forEach((child) => registerRoute(child, mountTo));
  return;
};

export const Route = (data) => data;

const navigate = (pathname) => (routes
  .find((route) => {
    const pattern = route.path.replace(/:[^/]+/g, '([^/]+)') + '/?$';
    const regex = new RegExp('^' + pattern);
    return regex.test(pathname);
  }));

export const mountRoute = async () => {
  const href = (window.location.href).replace(/\/+$/, '');
  if (window.location.href.at(-1) === '/') history.replaceState({}, '', href);
  const { pathname } = new URL(href);
  const { component, mountTo } = navigate(pathname);
  await render(mountTo, await component());
};

export const navigateBack = () => {
  history.back();
};

export const redirect = (route) => {
  history.pushState({}, '', `${route}`);
  mountRoute();
};

export const refreshPage = () => {
  const currentUrl = window.location.href;
  history.replaceState({}, '', currentUrl);
  mountRoute();
};

window.addEventListener('popstate', () => mountRoute());
