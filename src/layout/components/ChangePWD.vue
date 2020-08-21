<template>
  <el-form
    ref="ruleForm"
    :model="ruleForm"
    status-icon
    :rules="rules"
    label-width="100px"
    class="demo-ruleForm"
  >
    <el-form-item label="原密码">
      <el-input v-model="ruleForm.oldPwd" type="password" autocomplete="off" />
    </el-form-item>
    <el-form-item label="新密码" prop="newPwd">
      <el-input v-model="ruleForm.newPwd" type="password" autocomplete="off" />
    </el-form-item>
    <el-form-item label="确认新密码" prop="newPwdAgain">
      <el-input
        v-model="ruleForm.newPwdAgain"
        type="password"
        autocomplete="off"
      />
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.ruleForm.newPwdAgain !== '') {
          this.$refs.ruleForm.validateField('newPwdAgain')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.newPwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      ruleForm: {
        oldPwd: '',
        newPwd: '',
        newPwdAgain: ''
      },
      rules: {
        newPwd: [{ validator: validatePass, trigger: 'blur' }],
        newPwdAgain: [{ validator: validatePass2, trigger: 'blur' }]
      }
    }
  }
}
</script>
