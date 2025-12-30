import Vue from 'vue'
import VueRouter from 'vue-router'
import jsCookie from 'js-cookie'

import Academic from '../pages/Academic/Academic.vue'
import Learn from '../pages/Learn/Learn.vue'
import Class from '../pages/Learn/Class.vue'
import Post from '../pages/Post/Post.vue'
import PostMain from '@/pages/Post/pages/PostMain.vue'
import Login from '../pages/Login/Login.vue'
import StudentInfo from '@/pages/InfoPage/StudentInfo.vue'
import TeacherInfo from '@/pages/InfoPage/TeacherInfo.vue'
import StudentCourseTable from '@/pages/InfoPage/pages/StudentCourseTable.vue'
import TeacherCourseTable from '@/pages/InfoPage/pages/TeacherCourseTable.vue'
import ClientTable from '@/pages/InfoPage/pages/ClientTable.vue'
import Index from '@/pages/Index/Index.vue'
import ModifyInfo from '@/pages/InfoPage/ModifyInfo.vue'
import StudyRoom from '@/pages/StudyRoom/StudyRoom.vue'
import axios from 'axios'
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
                    path:'learn',
                    component:Learn
                },
                {
                    path:'studyRoom',
                    component:StudyRoom
                },
                {
                    path:'class/:idx?',
                    component:Class
                },
                {
                    path:'login',
                    component:Login
                },
                {
                    path:'studentInfo',
                    component:StudentInfo,
                    children:[{
                        path:'studentCourseTable',
                        component:StudentCourseTable
                    },{
                        path:'/',
                        redirect:'studentCourseTable'
                    }]
                },
                {
                    path:'teacherInfo',
                    component:TeacherInfo,
                    children:[
                    {
                        path:'clientTable',
                        component:ClientTable
                    },
                    {
                        path:'teacherCourseTable',
                        component:TeacherCourseTable
                    },
                    {
                        path:'/',
                        redirect:'clientTable'
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
    ]
})
router.beforeEach(async (to, from, next) => {
    const token = jsCookie.get('authToken')
    
    // 通用驗證
    const allowedPaths = ['/', '/academic/login'];
    if(!allowedPaths.includes(to.path) && !token) return next('/academic/login')
    
    const res = await axios.post('/login/token',{save:false},{
        headers:{
            'x-user-token':token,
            'x-user-fingerprint':localStorage.getItem('deviceFingerprint')
        }
    })

    if (!allowedPaths.includes(to.path) && !(res.data.userInfo)){
        jsCookie.remove('authToken')
        next('/academic/login')
        location.reload()
        return;
    }

    // 訪問教師資料
    else if(to.fullPath.includes('teacherInfo')){

        if(res.data.userInfo && res.data.userInfo.typeEng =='teacher') return next();
        else{
            jsCookie.remove('authToken')
            next('/academic/login')
            location.reload()
            return
        }
    }
    // 訪問學生資料
    else if(to.fullPath.includes('studentInfo')){

        if(res.data.userInfo && res.data.userInfo.typeEng =='student') next();
        else{
            jsCookie.remove('authToken')
            next('/academic/login')
            location.reload()
            return
        }
    }
    return next();
});

export default router