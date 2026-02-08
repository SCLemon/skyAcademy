import Vue from 'vue'
import VueRouter from 'vue-router'
import jsCookie from 'js-cookie'
import axios from 'axios'

import Index from '@/pages/Index/Index.vue'
import Academic from '../pages/Academic/Academic.vue'
import ColumnList from '../pages/Column/ColumnList.vue'
import Column from '../pages/Column/Column.vue'
import Post from '../pages/Post/Post.vue'
import PostMain from '@/pages/Post/pages/PostMain.vue'
import Login from '../pages/Login/Login.vue'
import Admin from '@/pages/InfoPage/Admin.vue'
import ColumnOverview from '@/pages/InfoPage/pages/ColumnOverview.vue'
import ClientOverview from '@/pages/InfoPage/pages/ClientOverview.vue'
import ModifyInfo from '@/pages/InfoPage/ModifyInfo.vue'
import StudyRoom from '@/pages/StudyRoom/StudyRoom.vue'

Vue.use(VueRouter)
const router = new VueRouter({
    routes:[
        {
            path:'/',
            component:Index,
        },
        {   
            path:'/academic',
            component:Academic,
            children:[
                {
                    path:'post/:share?',
                    component:Post,
                    children:[
                        {
                            path:'',
                            component:PostMain
                        }
                    ]
                },
                {
                    path:'columnList',
                    component:ColumnList
                },
                {
                    path:'column/:idx?',
                    component:Column
                },
                {
                    path:'studyRoom',
                    component:StudyRoom
                },
                {
                    path:'login',
                    component:Login
                },
                {
                    path:'admin',
                    component:Admin,
                    children:[
                    {
                        path:'clientOverview',
                        component:ClientOverview
                    },
                    {
                        path:'columnOverview',
                        component:ColumnOverview
                    },
                    {
                        path:'/',
                        redirect:'clientOverview'
                    }]
                },
                {
                    path:'modifyInfo',
                    component:ModifyInfo
                },
                {
                    path:'/',
                    redirect:'post'
                },
            ]
        },
        
        // 不存在的路徑 → 直接跳轉
        {
            path: '*',
            redirect: '/'
        }
    ]
})
router.beforeEach(async (to, from, next) => {
    const token = jsCookie.get('authToken')
    
    // 通用驗證
    const allowedPaths = ['/', '/academic/login'];
    if (allowedPaths.includes(to.path)) {
        return next()
    }
    if (!token) {
        return next('/academic/login')
    }
    
    const res = await axios.post('/login/token',{save:false},{
        headers:{
            'x-user-token':token,
            'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
        }
    })

    if (!(res.data.userInfo)){
        jsCookie.remove('authToken')
        localStorage.removeItem('currentUser');
        location.reload();
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(res.data.userInfo))
    
    // 訪問教師資料
    if(to.fullPath.includes('admin')){

        if(res.data.userInfo && res.data.userInfo.typeEng =='teacher') return next();
        else{
            jsCookie.remove('authToken');
            localStorage.removeItem('currentUser');
            location.reload();
            return
        }
    }
    return next();
});

export default router