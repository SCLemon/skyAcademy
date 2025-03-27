import Vue from 'vue'
import VueRouter from 'vue-router'
import jsCookie from 'js-cookie'

import Academic from '../pages/Academic/Academic.vue'
import Learn from '../pages/Learn/Learn.vue'
import Post from '../pages/Post/Post.vue'
import Practice from '../pages/Practice/Practice.vue'
import Login from '../pages/Login/Login.vue'
import StudentInfo from '@/pages/InfoPage/StudentInfo.vue'
import TeacherInfo from '@/pages/InfoPage/TeacherInfo.vue'
import StudentCourseTable from '@/pages/InfoPage/pages/StudentCourseTable.vue'
import TeacherCourseTable from '@/pages/InfoPage/pages/TeacherCourseTable.vue'
import ClientTable from '@/pages/InfoPage/pages/ClientTable.vue'
import axios from 'axios'
Vue.use(VueRouter)
const router = new VueRouter({
    routes:[
        {
            path:'/academic',
            component:Academic,
            children:[
                {
                    path:'post',
                    component:Post
                },
                {
                    path:'learn',
                    component:Learn
                },
                {
                    path:'practice',
                    component:Practice
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
                    children:[{
                        path:'studentCourseTable',
                        component:StudentCourseTable
                    },
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
                    path:'/',
                    redirect:'post'
                },
            ]
        },
        {
            path:'/',
            redirect:'/academic'
        },
    ]
})
router.beforeEach(async (to, from, next) => {
    const token = jsCookie.get('authToken')
    // 訪問教師資料
    if(to.fullPath.includes('teacherInfo')){
        if (!token) {
            alert('使用者權限不足')
            return next('/academic/login')
        }
        const res = await axios.post('/login/token',{},{
            headers:{
                'x-user-token':token
            }
        })
        if(res.data.userInfo && res.data.userInfo.typeEng =='teacher') next();
        else{
            alert('使用者權限不足')
            jsCookie.remove('authToken')
            next('/academic/login')
            location.reload()
        }
    }
    // 訪問學生資料
    else if(to.fullPath.includes('studentInfo')){
        if (!token) {
            alert('使用者權限不足')
            return next('/academic/login')
        }
        const res = await axios.post('/login/token',{},{
            headers:{
                'x-user-token':token
            }
        })
        if(res.data.userInfo && res.data.userInfo.typeEng =='student') next();
        else{
            alert('使用者權限不足')
            jsCookie.remove('authToken')
            next('/academic/login')
            location.reload()
        }
    }
    else next();
    next()
});

export default router