    <template>
        <div>
        <div class="tableTitle">
            <div class="tableTitle_left">課程總覽</div>
            <el-button class="tableTitle_right" @click="dialogFormVisible = true">新增課程</el-button>
        </div>
            <el-table :data="tableData" border height="calc(100vh - 360px)" style="width: 100%" class="tableData" empty-text="暫無數據">
                <el-table-column prop="createTime" label="創建時間"></el-table-column>
                <el-table-column prop="courseId" label="課程代碼"></el-table-column>
                <el-table-column prop="lecturer" label="授課教師"></el-table-column>
                <el-table-column prop="status" label="狀態">
                    <template v-slot="scope">
                        <div :class="scope.row.status?'valid':'invalid'">{{ scope.row.status?'公開':'不公開' }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="管理操作" width="250">
                    <template v-slot="scope">
                        <div class="btn">
                            <el-button class="btn_link" @click="openStudentList(scope.row)">編輯</el-button>
                            <el-button class="btn_link" type="warning" @click="stopCourse(scope.row.courseId,scope.row.idx)">{{scope.row.status?'隱藏':'公開'}}</el-button>
                            <el-button class="btn_link" type="danger" @click="deleteCourse(scope.row.courseId,scope.row.idx)">刪除</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog title="創建課程" :visible.sync="dialogFormVisible">
                <el-form :model="form">
                    <el-form-item label="課程名稱">
                        <el-input v-model="form.courseName" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="課程代碼">
                        <el-input v-model="form.courseId" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="授課教師">
                        <el-input v-model="form.lecturer" autocomplete="off" clearable></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取消</el-button>
                    <el-button type="primary" @click="create()">創建</el-button>
                </div>
            </el-dialog>
            <el-dialog :title="`${setStudentList.courseId} - 修課名單`" :visible.sync="dialogFormVisible2">
                <el-form :model="setStudentList">
                    <el-form-item label="課程代碼">
                        <el-input v-model="setStudentList.courseId" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="授課教師">
                        <el-input v-model="setStudentList.lecturer" autocomplete="off" clearable></el-input>
                    </el-form-item>
                </el-form>
                <el-transfer class="transfer" v-model="setStudentList.studentList" :props="{key: 'idx', label: 'name'}" :filterable="true" :filter-method="customFilter"
                filter-placeholder="請輸入學生姓名" :data="students" :titles="['學生列表', '已選學生']"></el-transfer>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible2 = false">取消</el-button>
                    <el-button type="primary" @click="pushStudentList()">保存</el-button>
                </div>
            </el-dialog>
        </div>
    </template>
    
    <script>
    import axios from 'axios'
    import jsCookie from 'js-cookie'
    export default {
        name:'TeacherCourseTable',
        data(){
            return{
                tableData: [],
                // 創建學生
                dialogFormVisible:false, 
                form:{
                    courseName:'',
                    courseId:'',
                    lecturer:''
                },
                // 指派課程
                dialogFormVisible2:false, 
                students:[],// 呈現在左列
                setStudentList:{
                    idx:'',
                    courseId:'',
                    lecturer:'',
                    newCourseId:'',
                    studentList:[] // 呈現在右列 (存 idx)
                }
            }
        },
        mounted(){
            this.getCourseList()
        },
        methods:{
            async getStudentList(){
                const res = await axios.get('/api/getStudent',{
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                })
                if(res.data.students) {
                    this.students = res.data.students
                    this.$bus.$emit('setStudentNum',this.students.length)
                }
                else this.$bus.$emit('handleAlert','用戶資料查詢通知',res.data.message,res.data.type)
            },
            async getCourseList(){
                const res = await axios.get('/api/getCourse',{
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                })
                if(res.data.courses) {
                    this.tableData = res.data.courses
                    this.$bus.$emit('setCourseNum',this.tableData.length)
                }
                else this.$bus.$emit('handleAlert','課程資料查詢通知',res.data.message,res.data.type)
            },

            // 創建課程
            async create(){
                const res = await axios.post('/api/createCourse',this.form,{
                    headers:{
                        'x-user-token':jsCookie.get('authToken')
                    }
                })
                if(res.data.type == 'success'){
                    this.getCourseList();
                    this.dialogFormVisible = false;
                    this.form = {
                        courseName:'',
                        courseId:'',
                        lecturer:''
                    },
                    this.$bus.$emit('handleAlert','課程資料創建通知',res.data.message,res.data.type)
                }
                else this.$bus.$emit('handleAlert','課程資料創建通知',res.data.message,res.data.type)
            },
            async deleteCourse(courseId, idx){
                try{
                    await this.$confirm(`確認是否刪除課程 (${courseId})?`, '提示', {
                        confirmButtonText: '刪除',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                    const res = await axios.delete(`/api/deleteCourse/${idx}`,{
                        headers:{
                            'x-user-token':jsCookie.get('authToken')
                        }
                    })
                    if(res.data.type == 'success'){
                        this.getCourseList();
                        this.$bus.$emit('handleAlert','課程資料刪除通知',res.data.message,res.data.type)
                    }
                    else this.$bus.$emit('handleAlert','課程資料刪除通知',res.data.message,res.data.type)
                }
                catch(e){}
            },
            async stopCourse(courseId, idx){
                try{
                    await this.$confirm(`確認是否變更課程 (${courseId}) 權限?`, '提示', {
                        confirmButtonText: '刪除',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                    const res = await axios.put(`/api/stopCourse/${idx}`,{},{
                        headers:{
                            'x-user-token':jsCookie.get('authToken')
                        }
                    })
                    if(res.data.type == 'success'){
                        this.getCourseList();
                        this.$bus.$emit('handleAlert','課程權限變更通知',res.data.message,res.data.type)
                    }
                    else this.$bus.$emit('handleAlert','課程權限變更通知',res.data.message,res.data.type)
                }
                catch(e){}
            },

            // 指派課程
            async openStudentList(target){
                this.setStudentList.idx = target.idx;
                this.setStudentList.courseId = target.courseId;
                this.setStudentList.lecturer = target.lecturer;

                // 刷新數據
                await this.getStudentList();
                await this.getCourseList();

                // 設置學生資料
                const course = this.tableData.filter((course)=> course.idx == target.idx)[0];
                this.setStudentList.studentList = course.studentList;
                
                // 開啟視窗
                this.dialogFormVisible2 = true;
            },
            async pushStudentList(){
                try{
                    await this.$confirm(`確認是否修改課程 (${this.setStudentList.courseId})?`, '提示', {
                        confirmButtonText: '確認',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                    const res = await axios.post('/api/setStudentToCourse',this.setStudentList,{
                        headers:{
                            'x-user-token':jsCookie.get('authToken')
                        }
                    })
                    if(res.data.type == 'success'){
                        this.getCourseList();
                        this.getStudentList();
                        this.dialogFormVisible2 = false;
                        this.setStudentList = {
                            idx:'',
                            courseId:'',
                            lecturer:'',
                            studentList:[]
                        },
                        this.$bus.$emit('handleAlert','課程修改通知',res.data.message,res.data.type)
                    }
                    else this.$bus.$emit('handleAlert','課程修改通知',res.data.message,res.data.type)
                }
                catch(e){}
            },
            customFilter(query, item) {
                return item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.account.toLowerCase().includes(query.toLowerCase())
            }
        }
    }
    </script>
    
    <style scoped>
        .table{
            width: 95%;
            margin: 0 auto;
            margin-top: 20px;
        }
        .tableTitle{
            line-height: 85px;
            text-align: center;
            display: flex;
            align-items: center;
        }
        .tableTitle_left{
            float: left;
            font-size: 24px;
        }
        .tableTitle_right{
            height: 40px;
            text-align: center;
            /* 放置最右邊 */
            margin-left: auto;
            font-size: 14px;
        }
        .tableTitle_right:hover{
            cursor: pointer;
            color: blue;
        }
        .valid{
            color: lightgreen;
        }
        .invalid{
            color: rgb(170, 170, 170);
        }
        .btn{
            display: flex;
            justify-content: space-evenly;
            align-items: center;
        }
        .btn_link{
            font-size: 14px;
        }
        .btn_link:hover{
            cursor: pointer;
        }
        .transfer{
            width:90%;
            margin: 0 auto;
        }
        ::v-deep .el-dialog{
            width: 720px;
            margin-top: 5vh !important;
        }
        ::v-deep .el-transfer-panel__empty{
            display: none;
        }
    </style>