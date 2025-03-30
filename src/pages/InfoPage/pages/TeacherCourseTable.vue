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
                <div class="class_banner_title">課程封面上傳（限制三張且上傳後暫不提供修改，至少 350 pixel x 175 pixel）</div>
                <el-upload  action="#" :on-change="handleUpload" list-type="picture-card" :auto-upload="false" :file-list="fileList" :limit="3" :multiple="true">
                    <i slot="default" class="el-icon-plus"></i>
                    <div slot="file" slot-scope="{file}">
                        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
                        <span class="el-upload-list__item-actions">
                            <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)"><i class="el-icon-zoom-in"></i></span>
                            <span class="el-upload-list__item-delete" @click="handleRemove(file)"><i class="el-icon-delete"></i></span>
                        </span>
                    </div>
                </el-upload>
                <el-dialog :visible.sync="dialogVisible"><img width="100%" :src="dialogImageUrl" alt=""></el-dialog>
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
                filter-placeholder="請輸入學生姓名或學號" :data="students" :titles="['學生列表', '已選學生']"></el-transfer>
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
                // 創建課程
                dialogFormVisible:false, 
                form:{
                    courseName:'',
                    courseId:'',
                    lecturer:''
                },
                // 創建課程的圖片上傳
                fileList: [],
                dialogImageUrl: '',
                dialogVisible: false,

                // 指派課程
                dialogFormVisible2:false, 
                students:[],// 呈現在左列
                setStudentList:{
                    idx:'',
                    courseId:'',
                    lecturer:'',
                    newCourseId:'',
                    studentList:[] // 呈現在右列 (存 idx)
                },
            }
        },
        mounted(){
            this.getCourseList()
        },
        methods:{
            async getStudentList(){
                const res = await axios.get('/api/infoPage/getStudent',{
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
                const res = await axios.get('/api/infoPage/getCourse',{
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

                const formData = new FormData();
                
                formData.append('courseName', this.form.courseName);
                formData.append('courseId', this.form.courseId);
                formData.append('lecturer', this.form.lecturer);

                if (this.fileList && this.fileList.length > 0) {
                    this.fileList.forEach((file, index) => {
                        console.log(file);
                        formData.append('attachments', file.raw);
                    });
                }
                const res = await axios.post('/api/infoPage/createCourse',formData,{
                    headers:{
                        'x-user-token':jsCookie.get('authToken'),
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
                    const res = await axios.delete(`/api/infoPage/deleteCourse/${idx}`,{
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
                    const res = await axios.put(`/api/infoPage/stopCourse/${idx}`,{},{
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
            // 創建課程的 banner 上傳
            handleUpload(file){
                if (this.fileList.length >= 5) return this.$bus.$emit('handleAlert','圖片上傳通知','僅允許上傳五張圖片','error')
                this.fileList.push(file)
            },
            handleRemove(file) {
                const index = this.fileList.indexOf(file);
                if (index !== -1) this.fileList.splice(index, 1);
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
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
                    const res = await axios.post('/api/infoPage/setStudentToCourse',this.setStudentList,{
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
            },
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
        .class_banner_title{
            margin-bottom: 20px;
        }
        ::v-deep .el-dialog{
            width: 720px;
            margin-top: 5vh !important;
        }
        ::v-deep .el-transfer-panel__empty{
            display: none;
        }
    </style>