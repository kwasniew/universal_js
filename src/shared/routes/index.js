import Home from "../pages/Home";
import Messages from "../pages/Messages";
import Message from "../pages/Message";
import NotFound from "../pages/NotFound";
import NotReadyYet from '../pages/NotReadyYet';

const routes = [
    {
        path: '/',
        exact: true,
        component: Home
    },
    {
        path: '/messages',
        component: Messages
    },
    {
        path: '/message/:id',
        component: Message
    },
    {
        path: '/soon',
        component: NotReadyYet
    },
    {
        path: '*',
        component: NotFound
    }
];

export default routes;