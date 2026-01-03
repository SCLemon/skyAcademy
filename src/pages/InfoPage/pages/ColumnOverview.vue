    <template>
        <div>
        <div class="tableTitle">
            <div class="tableTitle_left">專欄總覽</div>
            <el-button class="tableTitle_right" @click="dialogFormVisible = true">新增專欄</el-button>
        </div>
            <el-table :data="tableData" border height="calc(100vh - 360px)" style="width: 100%" class="tableData" empty-text="暫無數據">
                <el-table-column prop="createTime" label="創建時間"></el-table-column>
                <el-table-column prop="courseName" label="專欄名稱"></el-table-column>
                <el-table-column prop="lecturer" label="專欄負責人"></el-table-column>
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
            <el-dialog title="創建專欄" :visible.sync="dialogFormVisible">
                <el-form :model="form">
                    <el-form-item label="專欄名稱">
                        <el-input v-model="form.courseName" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="專欄代碼">
                        <el-input v-model="form.courseId" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="專欄負責人">
                        <el-input v-model="form.lecturer" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="專欄類別">
                        <el-select v-model="form.courseType" placeholder="請選擇類別">
                            <el-option v-for="item in courseTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div class="class_banner_title">專欄封面上傳（限制兩張，上傳後暫不提供修改，至少 350 pixel x 175 pixel）</div>
                <el-upload  action="#" :on-change="handleUpload" list-type="picture-card" :auto-upload="false" :file-list="fileList" :limit="2" :multiple="true" accept="image/*">
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
            <el-dialog :title="`${setStudentList.courseName} - 用戶名單`" :visible.sync="dialogFormVisible2">
                <el-form :model="setStudentList">
                    <el-form-item label="專欄名稱">
                        <el-input v-model="setStudentList.courseName" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="專欄代碼">
                        <el-input v-model="setStudentList.courseId" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="專欄負責人">
                        <el-input v-model="setStudentList.lecturer" autocomplete="off" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="專欄類別">
                        <el-select v-model="setStudentList.courseType" placeholder="請選擇類別">
                            <el-option v-for="item in courseTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <el-transfer class="transfer" v-model="setStudentList.studentList" :props="{key: 'idx', label: 'name'}" :filterable="true" :filter-method="customFilter"
                filter-placeholder="請輸入用戶姓名或帳號" :data="students" :titles="['用戶列表', '已選用戶']"></el-transfer>
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
        name:'CoulmnOverview',
        data(){
            return{
                tableData: [],
                courseTypeOptions:[
                    {label:'學術筆記',value:'學術筆記'},
                    {label:'金融時事',value:'金融時事'},
                    {label:'程式設計',value:'程式設計'},
                    {label:'其他類別',value:'其他類別'},
                ],
                // 創建專欄
                dialogFormVisible:false, 
                form:{
                    courseName:'',
                    courseId:'',
                    lecturer:'',
                    courseType:'',
                },
                // 創建專欄的圖片上傳
                fileList: [],
                dialogImageUrl: '',
                dialogVisible: false,

                // 指派專欄
                dialogFormVisible2:false, 
                students:[],// 呈現在左列
                setStudentList:{
                    idx:'',
                    courseId:'',
                    courseName:'',
                    lecturer:'',
                    courseType:'',
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
                if(res.data.type == 'success') {
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
                if(res.data.type == 'success') {
                    this.tableData = res.data.courses
                    this.$bus.$emit('setCourseNum',this.tableData.length)
                }
                else this.$bus.$emit('handleAlert','專欄資料查詢通知',res.data.message,res.data.type)
            },

            // 創建專欄
            async create(){
                
                const formData = new FormData();
                
                formData.append('courseName', this.form.courseName);
                formData.append('courseId', this.form.courseId);
                formData.append('lecturer', this.form.lecturer);
                formData.append('courseType', this.form.courseType);

                if (this.fileList && this.fileList.length > 0) {
                    this.fileList.forEach((file, index) => {
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
                    
                    // 重置
                    this.dialogFormVisible = false;
                    this.form = {
                        courseName:'',
                        courseId:'',
                        lecturer:'',
                        courseType:'',
                    },

                    // 獲取使用容量
                    this.$bus.$emit('getUsageMemory')
                    this.$bus.$emit('handleAlert','專欄資料創建通知',res.data.message,res.data.type)
                }
                else this.$bus.$emit('handleAlert','專欄資料創建通知',res.data.message,res.data.type)
            },
            async deleteCourse(courseId, idx){
                try{
                    await this.$confirm(`確認是否刪除專欄 (${courseId})?`, '提示', {
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
                        // 獲取使用容量
                        this.$bus.$emit('getUsageMemory')
                        this.$bus.$emit('handleAlert','專欄資料刪除通知',res.data.message,res.data.type)
                    }
                    else this.$bus.$emit('handleAlert','專欄資料刪除通知',res.data.message,res.data.type)
                }
                catch(e){}
            },
            async stopCourse(courseId, idx){
                try{
                    await this.$confirm(`確認是否變更專欄 (${courseId}) 權限?`, '提示', {
                        confirmButtonText: '確認',
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
                        this.$bus.$emit('handleAlert','專欄權限變更通知',res.data.message,res.data.type)
                    }
                    else this.$bus.$emit('handleAlert','專欄權限變更通知',res.data.message,res.data.type)
                }
                catch(e){}
            },
            // 創建專欄的 banner 上傳
            handleUpload(file){
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

            // 指派專欄
            async openStudentList(target){
                this.setStudentList.idx = target.idx;
                this.setStudentList.courseId = target.courseId;
                this.setStudentList.courseName = target.courseName;
                this.setStudentList.lecturer = target.lecturer;
                this.setStudentList.courseType = target.courseType;
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
                    await this.$confirm(`確認是否修改專欄資訊?`, '提示', {
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
                            studentList:[],
                            courseType:'',
                        },
                        this.$bus.$emit('handleAlert','專欄修改通知',res.data.message,res.data.type)
                    }
                    else this.$bus.$emit('handleAlert','專欄修改通知',res.data.message,res.data.type)
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
            margin-top: 20px;
            margin-bottom: 20px;
        }
        ::v-deep .el-dialog{
            width: 720px;
            margin-top: 5vh !important;
        }
        ::v-deep .el-transfer-panel__empty{
            display: none;
        }
        ::v-deep .el-upload--picture-card, ::v-deep .el-upload-list__item {
            width: 260px !important;
            height: 130px !important;
            line-height: 130px !important; /* 讓圖標垂直置中 */
        }
    </style>