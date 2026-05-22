<template>
  <el-container>
    
          <el-header 
            v-show="!data.navCollapsed"
            class="top-nav-header">
            <div class="nav">
              <div style="flex:1">
                <el-button-group>
                  <!-- 打开已存在主机配置 -->
                  <el-button type="primary" :icon="Menu" @click="data.modify_devices_dialog_visible = true"></el-button>

                  <el-button type="primary" @click="newHost" :icon="CirclePlus"></el-button>
                  <!-- 执行命令及收藏 -->
                  <el-popover placement="bottom" trigger="click" width="fit-content">
                    <template #reference>
                      <el-button type="primary" :icon="CopyDocument"></el-button>
                    </template>
                    <el-form :model="cmd">
                      <el-form-item label="执行命令">
                        <el-input v-model="cmd.data" type="textarea" autocomplete="off" placeholder="命令或脚本" />
                      </el-form-item>
                      <el-row>
                        <el-form-item label="会话选择">
                          <el-radio-group v-model="cmd.node">
                            <el-radio value="current">当前会话</el-radio>
                            <el-radio value="all">所有会话</el-radio>
                          </el-radio-group>
                        </el-form-item>
                      </el-row>
                      <el-row>
                        <el-form-item>
                          <el-input v-model="cmd.name" maxlength="32" show-word-limit placeholder="收藏该命令,在此输名称">
                            <template #append>
                              <el-button-group style="color:blue;display:flex">
                                <el-button @click="addCmdNote">收藏</el-button>
                                <el-button @click="execCmd">执行</el-button>
                              </el-button-group>
                            </template>
                          </el-input>
                        </el-form-item>
                      </el-row>
                    </el-form>
                  </el-popover>

                  <!-- 命令收藏列表 -->
                  <el-popover placement="bottom" trigger="click" :width="'95%'" :style="{ maxWidth: '800px' }">
                    <template #reference>
                      <el-button type="primary" :icon="Star"></el-button>
                    </template>

                    <div style="overflow-x: auto;">
                      <el-table :data="filterCmdNoteTable" :height="260" style="min-width: 600px;">
                        <el-table-column sortable width="180" :show-overflow-tooltip="true" property="cmd_name"
                          label="名称"></el-table-column>

                        <el-table-column sortable property="cmd_data" label="命令">
                          <template #default="scope">
                            <el-popover effect="light" trigger="hover" placement="right" :width="'auto'">
                              <template #default>
                                <div style="word-break: break-all;">命令详情</div>
                                <el-input v-model="scope.row.cmd_data" type="textarea" :autosize="{ minRows: 4, maxRows: 20 }"
                                  :disabled="true" style="width: 100%; min-width: 300px;" />
                                <div style="margin-top: 10px;">
                                  <el-button-group style="display: flex; flex-wrap: wrap; gap: 5px;">
                                    <el-tooltip effect="dark" content="执行命令,发送到所有会话" placement="top-start">
                                      <el-button type="warning" @click="execCmdAllSession(scope.row)"
                                        style="flex: 1 1 auto;">发送所有会话</el-button>
                                    </el-tooltip>
                                    <el-tooltip effect="dark" content="执行命令,发送到当前会话" placement="top-start">
                                      <el-button type="primary" @click="execCmdCurrentSession(scope.row)"
                                        style="flex: 1 1 auto;">发送当前会话</el-button>
                                    </el-tooltip>
                                  </el-button-group>
                                </div>
                              </template>
                              <template #reference>
                                {{ scope.row.cmd_data.substring(0, 15) + "..." }}
                              </template>
                            </el-popover>
                          </template>
                        </el-table-column>

                        <el-table-column label="操作" fixed="right" width="320">
                          <template #header>
                            <el-input v-model="searchCmdNote" placeholder="名称搜索" style="width: 100%;" />
                          </template>
                          <template #default="scope">
                            <el-button-group style="display: flex; flex-wrap: wrap; gap: 5px;">
                              <el-popconfirm confirmButtonText="删除" cancelButtonText="取消" icon="el-icon-info" iconColor="red"
                                title="确定删除吗" @confirm="delCmdNote(scope.row.id)">
                                <template #reference>
                                  <el-button type="danger" style="flex: 1 1 auto;">删除</el-button>
                                </template>
                              </el-popconfirm>

                              <el-tooltip effect="dark" content="执行命令,发送到所有会话" placement="top-start">
                                <el-button type="warning" @click="execCmdAllSession(scope.row)"
                                  style="flex: 1 1 auto;">发送所有会话</el-button>
                              </el-tooltip>
                              <el-tooltip effect="dark" content="执行命令,发送到当前会话" placement="top-start">
                                <el-button type="primary" @click="execCmdCurrentSession(scope.row)"
                                  style="flex: 1 1 auto;">发送当前会话</el-button>
                              </el-tooltip>
                            </el-button-group>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </el-popover>
                </el-button-group>
              </div>
              <div class="right" style="text-align: right">
                <el-button-group>
                  <el-button type="primary" :icon="Upload" :loading="chkingUpdate" @click="checkUpdate"></el-button>

                  <el-button type="primary" :icon="MagicStick" @click="openThemeSettings"></el-button>

                  <el-button type="primary" :icon="Avatar" @click="data.modify_pwd_dialog_visible = true"></el-button>

                  <!-- admin 角色才能管理 -->
                  <el-button v-if="globalStore.isAdmin === 'Y'" type="danger" :icon="Tools" @click="toManage"></el-button>
                  <el-popconfirm confirmButtonText="退出" cancelButtonText="取消" icon="el-icon-info" iconColor="red"
                    title="确定退出吗" @confirm="logout">
                    <template #reference>
                      <el-button :icon="SwitchButton" type="danger"></el-button>
                    </template>
                  </el-popconfirm>
                </el-button-group>
              </div>
            </div>

            <!-- 展开状态：向上箭头，点击收起 -->
            <button
              class="nav-anchor-toggle nav-anchor-toggle-open"
              @click="data.navCollapsed = true"
              title="收起导航栏"
            >
              <span class="nav-anchor-icon">
                <el-icon>
                  <ArrowUp />
                </el-icon>
              </span>
            </button>
          </el-header>

          <!-- 折叠状态：固定在页面顶部的细条展开按钮 -->
          <div
            v-show="data.navCollapsed"
            class="nav-toggle-closed"
            @click="data.navCollapsed = false"
            title="展开导航栏"
          >
            <el-icon><ArrowDown /></el-icon>
          </div>

          <div>
            <el-dialog
              :title="'主机管理'"
              v-model="data.modify_devices_dialog_visible"
              :width="'95%'"
              :style="{ maxWidth: '780px', top: '20px' }"
              custom-class="modern-dialog host-manage-dialog"
              :modal-append-to-body="true"
              :destroy-on-close="true"
              :center="false"
              :fullscreen="isMobile"
            >
              <!-- 搜索输入 -->
              <el-input v-model="searchHost" placeholder="名称及主机搜索" clearable style="margin-bottom: 10px; width: 100%;" />

              <el-table :data="filterHostTable" :height="tableHeight" :show-overflow-tooltip="true" style="width: 100%;">
                <el-table-column sortable fixed="left" width="150" property="name" label="名称" />
                <el-table-column sortable width="150" property="address" label="主机" />
                <el-table-column sortable width="100" property="user" label="用户" />
                <el-table-column sortable width="90" property="port" label="端口" />
                <el-table-column label="操作" fixed="right" width="250">
                  <template #default="scope">
                    <el-button size="small" @click="editHost(scope.row)">编辑</el-button>
                    <el-popconfirm confirmButtonText="删除" cancelButtonText="取消" icon="el-icon-info" iconColor="red"
                      title="确定删除吗" @confirm="deleteHost(scope.row)">
                      <template #reference>
                        <el-button size="small" type="danger">删除</el-button>
                      </template>
                    </el-popconfirm>
                    <el-button size="small" type="primary" @click="connectHost(scope.row)">连接</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <span slot="footer" class="dialog-footer">
                <el-button style="margin-top: 10px;" @click="data.modify_devices_dialog_visible = false">关闭</el-button>
              </span>
            </el-dialog>

            <!-- 修改密码 -->
            <el-dialog
              v-model="data.modify_pwd_dialog_visible"
              title="修改密码"
              custom-class="modern-dialog password-dialog"
              style="max-width: 360px;"
              width="100%"
              center
            >
              <el-form>
                <el-form-item>
                  <el-input v-model="data.new_pwd_one" trim type="password" minlength="3" maxlength="64" show-word-limit
                    show-password clearable placeholder="输入新密码">
                    <template #prepend>输入新密码</template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-input v-model="data.new_pwd_two" trim type="password" minlength="3" maxlength="64" show-word-limit
                    show-password clearable placeholder="确认新密码">
                    <template #prepend>确认新密码</template>
                  </el-input>
                </el-form-item>
              </el-form>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="data.modify_pwd_dialog_visible = false">取消</el-button>
                  <el-button type="primary" @click="modifyPassword">
                    提交
                  </el-button>
                </div>
              </template>
            </el-dialog>

            <!-- 更新代理选择对话框 -->
            <el-dialog
              v-model="data.update_proxy_dialog_visible"
              title="选择下载代理"
              custom-class="modern-dialog"
              style="max-width: 600px;"
              width="95%"
              center
            >
              <div v-if="updateVersionInfo">
                <div class="version-info-card">
                  <div class="version-row">
                    <span class="version-label">当前版本</span>
                    <span class="version-value">{{ updateVersionInfo.current_version }}</span>
                  </div>
                  <div class="version-arrow">→</div>
                  <div class="version-row">
                    <span class="version-label">最新版本</span>
                    <span class="version-value highlight">{{ updateVersionInfo.latest_version }}</span>
                  </div>
                </div>
                <div class="update-file-info">
                  <span class="file-name">{{ updateVersionInfo.asset_name || "-" }}</span>
                  <span class="file-size">{{ (updateVersionInfo.asset_size / 1024 / 1024).toFixed(2) }} MB</span>
                </div>

                <el-form style="margin-top: 16px;">
                  <el-form-item>
                    <el-checkbox v-model="useCustomProxy">自定义</el-checkbox>
                    <span v-if="isTestingSpeed && !useCustomProxy" style="margin-left: 10px; color: #409eff; font-size: 12px;">
                      <el-icon class="is-loading"><Loading /></el-icon> 测速中...
                    </span>
                  </el-form-item>

                  <!-- 自定义代理输入 + 测试过程 -->
                  <template v-if="useCustomProxy">
                    <el-form-item label="代理地址">
                      <el-input
                        v-model="customProxyUrl"
                        placeholder="https://your-proxy/   留空表示直连"
                        clearable
                        :disabled="customTestStatus === 'testing'"
                      />
                    </el-form-item>

                    <el-form-item v-if="customTestStatus !== 'idle'">
                      <div style="width: 100%;">
                        <el-tag v-if="customTestStatus === 'testing'" type="info">
                          <el-icon class="is-loading" style="vertical-align: middle;"><Loading /></el-icon>
                          {{ customTestMessage }}
                        </el-tag>
                        <el-tag v-else-if="customTestStatus === 'success'" type="success">
                          ✓ {{ customTestMessage }}
                        </el-tag>
                        <el-tag v-else-if="customTestStatus === 'failed'" type="danger">
                          ✗ {{ customTestMessage }}
                        </el-tag>
                      </div>
                    </el-form-item>
                  </template>

                  <!-- 内置代理选择 -->
                  <el-form-item v-else label="下载代理">
                    <el-select v-model="selectedProxy" placeholder="请选择代理" style="width: 100%;">
                      <el-option
                        v-for="proxy in updateProxies"
                        :key="proxy.url"
                        :label="proxy.name"
                        :value="proxy.url"
                      >
                        <span>{{ proxy.name }}</span>
                        <span v-if="speedTestResults.length > 0" style="float: right; color: #8492a6; font-size: 13px;">
                          <template v-for="result in speedTestResults" :key="result.proxy">
                            <span v-if="result.proxy === proxy.url && result.success" style="color: #67c23a;">
                              {{ result.speed.toFixed(0) }} KB/s
                            </span>
                            <span v-else-if="result.proxy === proxy.url && !result.success" style="color: #f56c6c;">
                              ✗
                            </span>
                          </template>
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="data.update_proxy_dialog_visible = false">取消</el-button>
                  <template v-if="useCustomProxy">
                    <el-button
                      type="primary"
                      @click="testCustomProxyAndDownload"
                      :loading="customTestStatus === 'testing'"
                      :disabled="customTestStatus === 'testing'"
                    >
                      测试并下载
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button @click="testProxySpeed" :loading="isTestingSpeed" :disabled="isTestingSpeed">
                      重新测速
                    </el-button>
                    <el-button type="primary" @click="startUpdate()" :disabled="isTestingSpeed">开始更新</el-button>
                  </template>
                </div>
              </template>
            </el-dialog>

            <!-- 更新进度对话框 -->
            <el-dialog
              v-model="data.update_progress_dialog_visible"
              title="系统更新"
              custom-class="modern-dialog update-progress-dialog"
              style="max-width: 520px;"
              width="95%"
              center
              :close-on-click-modal="false"
              :close-on-press-escape="false"
            >
              <div class="update-progress-content">
                <!-- 进度条区域 -->
                <div class="progress-bar-section">
                  <div class="progress-bar-wrapper">
                    <div class="progress-bar-track">
                      <div
                        class="progress-bar-fill"
                        :class="updateProgress.status"
                        :style="{ width: updateProgress.percent + '%' }"
                      >
                        <div class="progress-bar-glow"></div>
                      </div>
                    </div>
                    <div class="progress-percent-text" :class="updateProgress.status">
                      {{ updateProgress.percent }}%
                    </div>
                  </div>
                  <div class="progress-size-info">
                    {{ formatBytes(updateProgress.downloaded) }} / {{ formatBytes(updateProgress.total) }}
                  </div>
                </div>

                <!-- 状态消息 -->
                <div class="progress-status-message" :class="updateProgress.status">
                  <el-icon v-if="updateProgress.status === 'downloading'" class="is-loading"><Loading /></el-icon>
                  <el-icon v-else-if="updateProgress.status === 'success'"><CircleCheck /></el-icon>
                  <el-icon v-else-if="updateProgress.status === 'failed'"><CircleClose /></el-icon>
                  <el-icon v-else-if="updateProgress.status === 'cancelled'"><WarningFilled /></el-icon>
                  <el-icon v-else-if="updateProgress.status === 'restarting'" class="is-loading"><Loading /></el-icon>
                  <span>{{ updateProgress.message || '准备中...' }}</span>
                </div>

                <!-- 详细信息表格 -->
                <div class="progress-info-table">
                  <div class="info-table-row">
                    <span class="info-table-label">下载代理</span>
                    <span class="info-table-value">{{ updateProgress.proxy || "直连" }}</span>
                  </div>
                  <div class="info-table-row">
                    <span class="info-table-label">下载速度</span>
                    <span class="info-table-value speed">
                      {{ updateProgress.status === 'downloading' ? formatSpeed(updateProgress.speed) : '--' }}
                    </span>
                  </div>
                  <div class="info-table-row" v-if="updateProgress.file_name">
                    <span class="info-table-label">文件名称</span>
                    <span class="info-table-value filename">{{ updateProgress.file_name }}</span>
                  </div>
                  <div class="info-table-row" v-if="updateProgress.sha256">
                    <span class="info-table-label">SHA256</span>
                    <span class="info-table-value sha256">{{ updateProgress.sha256 }}</span>
                  </div>
                </div>
              </div>
              <template #footer>
                <div class="dialog-footer">
                  <el-button
                    v-if="updateProgress.status === 'downloading'"
                    type="danger"
                    @click="cancelDownload"
                  >
                    取消下载
                  </el-button>
                  <el-button
                    v-else
                    @click="closeProgressDialog"
                    :type="updateProgress.status === 'success' ? 'primary' : 'default'"
                  >
                    {{ updateProgress.status === 'success' ? '完成' : '关闭' }}
                  </el-button>
                </div>
              </template>
            </el-dialog>

            <!-- SSH主机配置弹窗 -->
            <el-dialog
              :title="data.mode == 0 ? '新增主机' : '更新主机'"
              v-model="data.host_dialog_visible"
              :width="'95%'"
              :style="{ maxWidth: '1040px', top: '20px' }"
              custom-class="modern-dialog host-config-dialog"
            >
              <el-form label-width="80px" ref="host_from">
                <el-collapse v-model="data.host_config_collapse">
                  <el-collapse-item title="基础配置" name="1">
                    <el-row :gutter="10">
                      <el-col :xs="24" :sm="16">
                        <el-form-item label="名称" prop="name">
                          <el-input v-model.trim="data.name" minlength="1" maxlength="30" show-word-limit
                            placeholder="请输入名称"></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row :gutter="10">
                      <el-col :xs="24" :sm="16">
                        <el-form-item label="主机" prop="address">
                          <el-input v-model.trim="data.address" minlength="1" maxlength="60" show-word-limit
                            placeholder="请输入主机地址"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="8">
                        <el-form-item label="网络" prop="net_type">
                          <el-radio-group v-model="data.net_type">
                            <el-radio value="tcp4">IPv4</el-radio>
                            <el-radio value="tcp6">IPv6</el-radio>
                          </el-radio-group>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row :gutter="10">
                      <el-col :xs="24" :sm="16">
                        <el-form-item label="用户" prop="user">
                          <el-input minlength="1" maxlength="60" v-model.trim="data.user" show-word-limit
                            placeholder="请输入用户名"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="8">
                        <el-form-item label="端口" prop="port">
                          <el-input-number v-model="data.port" :min="1" :max="65535" style="width: 100%;"></el-input-number>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row>
                      <el-form-item label="认证方式">
                        <el-radio-group v-model="data.auth_type">
                          <el-radio value="pwd">密码</el-radio>
                          <el-radio value="cert">密钥</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-row>

                    <el-row :gutter="10" v-if="data.auth_type === 'cert'">
                      <el-col :xs="24" :sm="16">
                        <el-form-item label="密钥">
                          <el-input v-model="data.cert_data" type="textarea" placeholder="请输入密钥内容或上传"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="8">
                        <el-form-item label="上传">
                          <el-button type="primary" @click="addCertFile">上传密钥文件</el-button>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row :gutter="10">
                      <el-col :xs="24" :sm="16">
                        <el-form-item v-if="data.auth_type === 'cert'" label="密钥口令" prop="cert_pwd">
                          <el-input v-model.trim="data.cert_pwd" type="password" show-password show-word-limit
                            placeholder="密钥口令"></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row :gutter="10">
                      <el-col :xs="24" :sm="16">
                        <el-form-item v-if="data.auth_type === 'pwd'" label="SSH密码" prop="pwd">
                          <el-input v-model.trim="data.pwd" type="password" show-password show-word-limit
                            placeholder="SSH密码"></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item title="高级配置" name="2">
                    <el-row :gutter="10">
                      <el-col :xs="24" :sm="9">
                        <el-form-item label="终端类型" prop="pty_type">
                          <el-select v-model="data.pty_type" placeholder="请选择终端类型" style="width: 100%;">
                            <el-option label="xterm-256color" value="xterm-256color" />
                            <el-option label="linux" value="linux" />
                            <el-option label="xtrem" value="xtrem" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="5">
                        <el-form-item label="字体颜色" prop="foreground">
                          <el-color-picker v-model="data.foreground"></el-color-picker>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="5">
                        <el-form-item label="背景颜色" prop="background">
                          <el-color-picker v-model="data.background"></el-color-picker>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="5">
                        <el-form-item label="光标颜色" prop="cursor_color">
                          <el-color-picker v-model="data.cursor_color"></el-color-picker>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row :gutter="10">
                      <el-col :xs="24" :sm="9">
                        <el-form-item label="字体">
                          <el-select v-model="data.font_family" placeholder="请选择字体" style="width: 100%;">
                            <el-option label="Courier" value="Courier" />
                            <el-option label="Courier New" value="Courier New" />
                            <el-option label="Menlo" value="Menlo" />
                            <el-option label="Monaco" value="Monaco" />
                            <el-option label="monospace" value="monospace" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="5">
                        <el-form-item label="字体大小">
                          <el-select v-model.number="data.font_size" placeholder="请选择字体大小" style="width: 100%;">
                            <el-option v-for="n in [8, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34]" :key="n" :label="n"
                              :value="n"></el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="4">
                        <el-form-item label="光标样式">
                          <el-select v-model="data.cursor_style" placeholder="请选择光标样式" style="width: 100%;">
                            <el-option label="块状" value="block" />
                            <el-option label="下划线" value="underline" />
                            <el-option label="竖线" value="bar" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row>
                      <el-col :xs="24">
                        <el-form-item label="连接命令">
                          <el-input v-model="data.init_cmd" type="textarea" :rows="2" placeholder="请输入连接后执行命令"
                            style="width: 100%;" />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row>
                      <el-col :xs="24">
                        <el-form-item label="连接横幅">
                          <el-input v-model="data.init_banner" type="textarea" :rows="2" placeholder="请输入连接后提示横幅"
                            style="width: 100%;" />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-collapse-item>
                </el-collapse>
              </el-form>

              <template #footer>
                <span class="dialog-footer">
                  <el-button style="margin-top: 10px;" @click="data.host_dialog_visible = false">取消</el-button>
                  <el-button style="margin-top: 10px;" type="success" @click="connect">连接</el-button>
                </span>
                <div style="width: 10px;display:inline-block"></div>
                <span v-if="data.mode == 0" class="dialog-footer">
                  <el-button style="margin-top: 10px;" type="primary" @click="createHost(false)">保存</el-button>
                  <el-button style="margin-top: 10px;" type="primary" @click="createHost(true)">连接并保存</el-button>
                </span>
                <span v-if="data.mode == 1" class="dialog-footer">
                  <el-button style="margin-top: 10px;" type="primary" @click="updateHost(false)">更新</el-button>
                  <el-button style="margin-top: 10px;" type="primary" @click="updateHost(true)">连接并更新</el-button>
                </span>
              </template>
            </el-dialog>

            <!-- SSH文件上传下载弹窗 -->
            <el-dialog
              v-model="data.file_dialog_visible"
              width="80%"
              custom-class="modern-dialog file-dialog"
              top="60px"
            >
              <template #header>
                <span v-html="title"></span>
              </template>

              <el-button-group style="width:auto;display: flex; flex-wrap: nowrap;overflow-x: auto;">
                <el-button v-for="(item, index) in data.dir_info.paths" :key="index"
                  @click="listDir(item.dir, data.current_host)">{{ item.name }}</el-button>
              </el-button-group>
              </br>

              <el-form-item style="margin-top: 10px;">
                <el-input v-model="data.sftp_current_dir" style="width: 100%;" placeholder="请输入路径" class="input-with-select">
                  <template #append>
                    <el-button-group style="color:blue">
                      <el-button @click="listDir(data.sftp_current_dir, data.current_host)">进入</el-button>
                      <el-button @click="uploadFile(data.sftp_current_dir)">上传</el-button>
                      <el-button @click="createDir(data.sftp_current_dir, data.current_host)">创建目录</el-button>
                      <el-button @click="listDir(data.sftp_current_dir, data.current_host)">刷新</el-button>
                    </el-button-group>
                  </template>
                </el-input>
              </el-form-item>
              </br>

              <el-row>
                <el-col :span="24">
                  <el-progress :percentage="data.sftp_upload_percentage" />
                </el-col>
              </el-row>

              <el-table :data="data.dir_info.files" height="400" :show-overflow-tooltip="true">
                <el-table-column prop="name" label="文件名" fixed="left" sortable>
                  <template #default="scope">
                    <el-button v-if="scope.row.type === 'f'" @click="downloadFile(scope.row)" type="primary" link
                      :icon="Files" style="color: green">{{ scope.row.name }}</el-button>
                    <el-button v-if="scope.row.type === 'd'" @click="listDir(scope.row.path, data.current_host)"
                      type="primary" link :icon="FolderOpened">{{ scope.row.name }}</el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="size" label="大小" width="100" sortable></el-table-column>
                <el-table-column prop="mode" label="权限" width="100" sortable></el-table-column>
                <el-table-column prop="mod_time" label="修改日期" width="180" sortable></el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="scope">
                    <el-button-group>
                      <el-button v-if="scope.row.type == 'f'" @click="downloadFile(scope.row)" type="success"
                        :icon="Bottom">下载</el-button>
                      <el-button v-else type="primary" :icon="Upload" @click="uploadFile(scope.row.path)">上传</el-button>
                      <el-popconfirm confirmButtonText="删除" cancelButtonText="取消" icon="el-icon-info" iconColor="red"
                        title="确定删除吗" @confirm="deleteFile(scope.row)">
                        <template #reference>
                          <el-button type="danger">删除</el-button>
                        </template>
                      </el-popconfirm>
                    </el-button-group>
                  </template>
                </el-table-column>
              </el-table>
            </el-dialog>

            <!-- 管理 -->
            <el-dialog title="系统管理" v-model="data.manage_dialog_visible" v-bind:fullscreen="true">
              <Manage></Manage>
            </el-dialog>

            <!-- 主题设置 -->
            <ThemeSettings ref="themeSettingsRef" />
          </div>
    
          

    <!-- 主内容页 -->
    <div v-if="data.host_tabs.length === 0"
      :style="mainBgStyle">
      <Main></Main>
    </div>


    <div v-else>
      <el-tabs v-model="data.current_host.session_id" type="card" closable @tab-remove="removeTab"
        @tab-click="selectTab">
        <el-tab-pane v-for="item in data.host_tabs" :key="item.session_id" :label="item.name" :name="item.session_id">
          <template #label>
            <el-button-group style="width:auto;display: flex; flex-wrap: nowrap;overflow-x: auto;">
              <el-popover placement="bottom" :width="400" trigger="hover">
                <template #reference>
                  <el-button :type="item.session_id === data.current_host.session_id
                    ? 'primary' : 'info'">
                    <span v-if="item.is_close" style="color:red">{{ item.name }}</span>
                    <span v-else="item.is_close" style="color:white">{{ item.name }}</span>
                  </el-button>
                </template>
                <div>
                  <div style="padding-top: 5px;">
                    <el-button-group>
                      <el-button type="primary" @click="connectHost(item, true)">重连</el-button>
                      <el-button type="primary" @click="item.term.clear()">清空缓冲区</el-button>
                    </el-button-group>
                  </div>
                  <div style="padding-top: 5px;">
                    <div>
                      <el-input disabled v-model="item.session_id">
                        <template #prepend>会话</template>
                      </el-input>
                    </div>
                    <div>
                      <el-input disabled v-model="item.address">
                        <template #prepend>主机</template>
                      </el-input>
                    </div>
                    <div>
                      <el-input disabled v-model="item.user">
                        <template #prepend>用户</template>
                      </el-input>
                    </div>
                    <div>
                      <el-input disabled v-model="item.port">
                        <template #prepend>端口</template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </el-popover>

              <el-tooltip class="item" effect="dark" content="文件传输" placement="top">
                <el-button :type="item.session_id === data.current_host.session_id
                  ? 'primary'
                  : 'info'
                  " @click="listDir('/', item)" :icon="Sort"></el-button>
              </el-tooltip>
            </el-button-group>
          </template>
          <template #default>
            <div id="term-data" style="margin: 1px">
              <div :id="item.session_id" style="width: 100vw;height:100vh"></div>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-container>
</template>

<script setup lang="ts">
import { useGlobalStore } from "@/stores/store";
import {
  ArrowDown,
  ArrowUp,
  Avatar,
  Bottom,
  CircleCheck,
  CircleClose,
  CirclePlus,
  Connection,
  CopyDocument,
  Document,
  Eleme,
  Files,
  FolderOpened,
  Loading,
  MagicStick,
  Menu,
  Sort,
  Star,
  SwitchButton,
  Tools,
  Upload,
  WarningFilled
} from "@element-plus/icons-vue";
import { AttachAddon } from "@xterm/addon-attach";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import axios, { type AxiosProgressEvent } from "axios";
import { ElMessage, ElMessageBox, ElNotification, ElPopover } from "element-plus";
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import Main from "./Main.vue";
import ThemeSettings from "@/components/ThemeSettings.vue";
import { useThemeStore } from "@/stores/themeStore";
const Manage = defineAsyncComponent(() => import('./Manage.vue'))


let router = useRouter();
let globalStore = useGlobalStore();
const themeStore = useThemeStore();

enum Mode {
  "create" = 0,
  "update" = 1,
}

interface ResponseData {
  code: number;
  msg: string;
  data?: any;
}

/**
 * 连接Host对象
 */
interface Host {
  id: number;
  name: string;
  address: string;
  user: string;
  auth_type: "pwd" | "cert";
  net_type: "tcp4" | "tcp6";
  cert_data: string;
  cert_pwd: string;
  pwd: string;
  port: number;
  font_size: number;
  background: string;
  foreground: string;
  cursor_color: string;
  font_family: string;
  cursor_style: "block" | "underline" | "bar";
  shell: string;
  pty_type: "xterm-256color" | "xterm" | "linux";
  init_cmd: string;
  init_banner: string;
  session_id: string;
  term: Terminal;
  fit: FitAddon;
  ws: WebSocket;
  is_close: boolean;
}

/**
 * 表单验证
 */
interface VerifyFromData {
  host: Host;
  is_success: boolean;
}

/**
 * sftp Path
 */
interface Path {
  dir: string;
  name: string;
}

/**
 * sftp FileInfo
 */
interface FileInfo {
  name: string;
  mod_time: string;
  mode: string;
  path: string;
  type: "d" | "f";
  size: number;
}

/**
 * sftp DirInfo
 */
interface DirInfo {
  current_dir: string;
  dir_count: number;
  file_count: number;
  files: Array<FileInfo>;
  paths: Array<Path>;
}

let data = reactive({
  navCollapsed: true,
  mode: Mode.create,
  id: 0,
  name: "",
  address: "",
  user: "",
  auth_type: "pwd",
  net_type: "tcp4",
  cert_data: "",
  cert_pwd: "",
  pwd: "",
  port: 22,
  h: 20,
  w: 80,
  session_id: "",
  background: "#000000",
  foreground: "#FFFFFF",
  cursor_color: "#FFFFFF",
  font_family: "Courier",
  font_size: 16,
  cursor_style: "block",
  shell: "bash",
  pty_type: "xterm-256color",
  init_cmd: "",
  init_banner: "",

  upload_path: "",
  download_path: "",
  host_list: [] as Array<Host>,
  host_tabs: [] as Array<Host>,

  current_host: { session_id: "" } as Host,
  host_config_collapse: ['1'],
  host_dialog_visible: false,
  file_dialog_visible: false,
  modify_devices_dialog_visible: false,
  modify_pwd_dialog_visible: false,
  manage_dialog_visible: false,
  update_proxy_dialog_visible: false,
  update_progress_dialog_visible: false,
  dir_info: {} as DirInfo,
  sftp_current_dir: "",
  sftp_upload_percentage: 0,
  new_pwd_one: "",
  new_pwd_two: "",
});

/**
 * 调试
 */
function debug() {
  console.log(data);
  console.log(data.current_host);
  console.log(data.host_list);
  console.log(data.host_tabs);
}

/**
 * 批量执行命令
 */
let cmd = reactive({ name: "", data: "", node: "current" });

interface CmdNode {
  id: number;
  cmd_name: string;
  cmd_data: string;
}

let cmdNotes = ref<Array<CmdNode>>([]);

/**
 * 搜索主机列表
 */
const searchHost = ref("");
const filterHostTable = computed(() =>
  data.host_list.filter(
    (i) =>
      !searchHost.value ||
      i.name.toLowerCase().includes(searchHost.value.toLowerCase()) ||
      i.address.toLowerCase().includes(searchHost.value.toLowerCase())
  )
)

// 主题设置
const themeSettingsRef = ref<InstanceType<typeof ThemeSettings> | null>(null);

function openThemeSettings() {
  themeSettingsRef.value?.open();
}

// 检查更新
const chkingUpdate = ref(false);

// "直连" 在 el-select 中需要非空 value，否则会显示 placeholder
const DIRECT_KEY = "__direct__";

// 更新相关状态
const updateProxies = ref<Array<{ url: string; name: string }>>([]);
const selectedProxy = ref("");
const updateProgress = ref({
  downloaded: 0,
  total: 0,
  percent: 0,
  speed: 0,
  status: "idle",
  message: "",
  proxy: "",
  file_name: "",
  sha256: "",
});
const updateVersionInfo = ref<any>(null);
let progressTimer: any = null;

// 测速相关状态
const speedTestResults = ref<Array<{ proxy: string; name: string; speed: number; duration: number; success: boolean; error: string }>>([]);
const isTestingSpeed = ref(false);

// 自定义代理相关状态
const useCustomProxy = ref(false);
const customProxyUrl = ref("");
const customTestStatus = ref<"idle" | "testing" | "success" | "failed">("idle");
const customTestMessage = ref("");
const customTestSpeed = ref(0);

async function checkUpdate() {
  if (chkingUpdate.value) return;

  chkingUpdate.value = true;

  try {
    const ret = await axios.get<ResponseData>("/api/update/version");

    if (ret.data.code !== 0) {
      ElMessage.error(ret.data.msg || "检测更新失败");
      return;
    }

    const info = ret.data.data;

    if (!info.has_update) {
      ElMessage.success(`已是最新版本：${info.current_version}`);
      return;
    }

    updateVersionInfo.value = info;

    // 获取代理列表
    const proxyRet = await axios.get<ResponseData>("/api/update/proxies");
    if (proxyRet.data.code === 0) {
      // 把直连的空 url 映射成 sentinel，避免 el-select 把它当成"未选择"
      updateProxies.value = (proxyRet.data.data as Array<{ url: string; name: string }>).map((p) => ({
        ...p,
        url: p.url === "" ? DIRECT_KEY : p.url,
      }));
      selectedProxy.value = updateProxies.value[0]?.url || "";
    }

    // 打开代理选择对话框
    data.update_proxy_dialog_visible = true;

    // 重置自定义代理状态
    useCustomProxy.value = false;
    customTestStatus.value = "idle";
    customTestMessage.value = "";
    customTestSpeed.value = 0;

    // 默认对内置代理进行一次测速
    await testProxySpeed();
  } catch (err: any) {
    console.log(err);
    ElMessage.error("检测更新异常");
  } finally {
    chkingUpdate.value = false;
  }
}

// 登录后静默检查更新：仅在有新版本时以 tips 提示，无需打扰
async function silentCheckUpdate() {
  try {
    const ret = await axios.get<ResponseData>("/api/update/version");
    if (ret.data.code !== 0) return;

    const info = ret.data.data;
    if (!info || !info.has_update) return;

    ElNotification({
      title: "发现新版本",
      type: "warning",
      duration: 8000,
      dangerouslyUseHTMLString: true,
      message: `当前版本 <b>${info.current_version}</b><br/>最新版本 <b>${info.latest_version}</b><br/>点击右上角更新按钮进行升级`,
    });
  } catch (err) {
    console.log("静默检查更新失败", err);
  }
}

// 测试内置代理速度
async function testProxySpeed() {
  if (!updateVersionInfo.value || isTestingSpeed.value) return;

  isTestingSpeed.value = true;
  speedTestResults.value = [];

  try {
    const testURL = updateVersionInfo.value.release_url || "https://github.com/cdwangtao/WebSSH-u60pro/releases/latest";

    const ret = await axios.post<ResponseData>("/api/update/test-speed", {
      url: testURL,
    });

    if (ret.data.code === 0) {
      // 同样把直连的空 proxy 映射成 sentinel，方便和 selectedProxy 比较
      speedTestResults.value = (ret.data.data as Array<any>).map((r) => ({
        ...r,
        proxy: r.proxy === "" ? DIRECT_KEY : r.proxy,
      }));

      const successResults = speedTestResults.value.filter(r => r.success);
      if (successResults.length > 0) {
        const fastest = successResults.reduce((prev, current) =>
          (current.speed > prev.speed) ? current : prev
        );
        selectedProxy.value = fastest.proxy;
        console.log(`自动选择最快代理: ${fastest.name} (${fastest.speed.toFixed(2)} KB/s)`);
      }
    }
  } catch (err) {
    console.log("测速失败", err);
  } finally {
    isTestingSpeed.value = false;
  }
}

// 开始更新（使用选择的代理），overrideProxy 用于自定义代理流程
async function startUpdate(overrideProxy?: string) {
  data.update_proxy_dialog_visible = false;
  data.update_progress_dialog_visible = true;

  const proxyForServer = overrideProxy !== undefined
    ? overrideProxy
    : (selectedProxy.value === DIRECT_KEY ? "" : selectedProxy.value);

  updateProgress.value = {
    downloaded: 0,
    total: 0,
    percent: 0,
    status: "downloading",
    message: "准备下载...",
    proxy: proxyForServer,
  };

  try {
    const ret = await axios.post<ResponseData>("/api/update/download", {
      proxy: proxyForServer,
    });

    if (ret.data.code !== 0) {
      ElMessage.error(ret.data.msg || "启动更新失败");
      updateProgress.value.status = "failed";
      updateProgress.value.message = ret.data.msg || "启动更新失败";
      return;
    }

    startProgressPolling();
  } catch (err) {
    console.log(err);
    ElMessage.error("执行更新异常");
    updateProgress.value.status = "failed";
    updateProgress.value.message = "执行更新异常";
  }
}

// 测试自定义代理，通过则自动下载安装
async function testCustomProxyAndDownload() {
  const url = customProxyUrl.value.trim();
  if (!url) {
    ElMessage.error("请输入自定义代理地址");
    return;
  }
  if (!updateVersionInfo.value) return;

  customTestStatus.value = "testing";
  customTestMessage.value = "正在测试该代理是否可用...";
  customTestSpeed.value = 0;

  try {
    const testURL = updateVersionInfo.value.release_url || "https://github.com/cdwangtao/WebSSH-u60pro/releases/latest";

    const ret = await axios.post<ResponseData>("/api/update/test-speed", {
      url: testURL,
      proxies: [url],
    });

    if (ret.data.code !== 0) {
      customTestStatus.value = "failed";
      customTestMessage.value = ret.data.msg || "测试请求失败";
      return;
    }

    const result = (ret.data.data as Array<any>)[0];
    if (!result) {
      customTestStatus.value = "failed";
      customTestMessage.value = "未拿到测试结果";
      return;
    }
    if (!result.success) {
      customTestStatus.value = "failed";
      customTestMessage.value = `测试失败：${result.error || "未知错误"}`;
      return;
    }

    customTestStatus.value = "success";
    customTestSpeed.value = result.speed;
    customTestMessage.value = `测试通过：${result.speed.toFixed(0)} KB/s（${result.duration} ms），即将开始下载...`;

    setTimeout(() => {
      startUpdate(url);
    }, 600);
  } catch (err: any) {
    console.log("自定义代理测试异常", err);
    customTestStatus.value = "failed";
    customTestMessage.value = "测试异常：" + (err?.message || String(err));
  }
}

// 轮询下载进度
function startProgressPolling() {
  if (progressTimer) {
    clearInterval(progressTimer);
  }
  progressTimer = setInterval(async () => {
    try {
      const ret = await axios.get<ResponseData>("/api/update/progress");
      if (ret.data.code === 0) {
        updateProgress.value = ret.data.data;

        if (updateProgress.value.status === "success" ||
            updateProgress.value.status === "failed" ||
            updateProgress.value.status === "restarting") {
          clearInterval(progressTimer);
          progressTimer = null;

          if (updateProgress.value.status === "success" ||
              updateProgress.value.status === "restarting") {
            ElNotification({
              title: "更新成功",
              type: "success",
              duration: 8000,
              message: "程序即将重启，请稍后刷新页面",
            });
          }
        }
      }
    } catch (err) {
      console.log("获取进度失败", err);
    }
  }, 500);
}

// 关闭进度对话框
function closeProgressDialog() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  data.update_progress_dialog_visible = false;
}

// 取消下载
async function cancelDownload() {
  try {
    await axios.post("/api/update/cancel");
    ElMessage.info("已发送取消请求");
  } catch (err) {
    console.error("取消下载失败", err);
  }
}

// 格式化字节
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 格式化速度
function formatSpeed(bytesPerSecond: number): string {
  if (!bytesPerSecond || bytesPerSecond === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 执行更新（旧入口，保留兼容）
async function runUpdate() {
  try {
    const ret = await axios.post<ResponseData>("/api/update/run");

    if (ret.data.code === 0) {
      ElNotification({
        title: "更新已开始",
        type: "success",
        duration: 8000,
        message: ret.data.msg || "程序即将重启，请稍后刷新页面",
      });
    } else {
      ElMessage.error(ret.data.msg || "启动更新失败");
    }
  } catch (err) {
    console.log(err);
    ElMessage.error("执行更新异常，可能程序正在重启");
  }
}

/**
 * 主机管理弹窗移动端适配
 */
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value <= 768)

const tableHeight = computed(() => {
  return isMobile.value
    ? Math.max(window.innerHeight - 190, 300)
    : 500
})

function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

/**
 * 搜索命令收藏列表
 */
const searchCmdNote = ref("");
const filterCmdNoteTable = computed(() =>
  cmdNotes.value.filter(
    (i) =>
      !searchCmdNote.value ||
      i.cmd_name.toLowerCase().includes(searchCmdNote.value.toLowerCase())
  )
)

/**
 * 状态报告定时器
 */
let statusSetInterval: number;

/**
 * sftp 文件传输弹窗title
 */
const title = computed(() => {
  let titleHtml = `<span style="color:red;">当前名称:${data.current_host.name} &nbsp;&nbsp;&nbsp;当前主机:${data.current_host.address}</span>`;
  return titleHtml;
});

/**
 * 修改密码
 */
function modifyPassword() {
  if (data.new_pwd_one.length < 2) {
    ElMessage.error("密码至少两个字符");
    return
  }
  if (data.new_pwd_two.length < 2) {
    ElMessage.error("密码至少两个字符");
    return
  }
  if (data.new_pwd_one !== data.new_pwd_two) {
    ElMessage.error("两次密码输入不一致");
    return
  }

  axios.patch<ResponseData>("/api/user/pwd", { "pwd": data.new_pwd_one }).then((ret) => {
    if (ret.data.code === 0) {
      ElMessage.success("密码修改成功");
    } else {
      ElMessage.error("密码修改失败");
    }
  }).catch(() => {
    ElMessage.error("密码修改错误");
  })
  data.modify_pwd_dialog_visible = false;
}

/**
 * 执行命令
 */
function execCmd() {
  if (cmd.node == "current") {
    execCmdCurrentSession({ "id": 0, "cmd_name": "", "cmd_data": cmd.data });
  }
  if (cmd.node == "all") {
    execCmdAllSession({ "id": 0, "cmd_name": "", "cmd_data": cmd.data });
  }
}

/**
 * 添加命令收藏
 */
function addCmdNote() {
  if (cmd.data.trim().length === 0) {
    ElMessage.error("收藏的命令不能为空");
    return;
  }

  if (cmd.name.trim().length === 0) {
    ElMessage.error("如果收藏命令,必须输入收藏名称");
    return;
  }

  axios.post<ResponseData>(`/api/cmd_note/`, { "cmd_name": cmd.name, "cmd_data": cmd.data })
    .then((ret) => {
      if (ret.data.code === 0) {
        ElMessage.success("收藏成功");
        getAllCmdNote();
      } else {
        ElMessage.error("收藏命令出错了");
      }
    });

}

/**
 * 删除命令收藏
 */
function delCmdNote(id: number) {
  axios.delete<ResponseData>(`/api/cmd_note/${id}`)
    .then((ret) => {
      if (ret.data.code === 0) {
        cmdNotes.value = ret.data.data;
        ElMessage.success("删除成功");
      } else {
        ElMessage.error("删除命令收藏出错了");
      }
    });
}

/**
 * 更新命令收藏
 */
function putCmdNote(id: number) {

}

/**
 * 查询所有命令收藏
 */
function getAllCmdNote() {
  axios.get<ResponseData>("/api/cmd_note").then((ret) => {
    if (ret.data.code === 0) {
      cmdNotes.value = ret.data.data;
    } else {
      ElMessage.error("获取主机列表错误");
    }
  });
}

/**
 * 在当前会话执行收藏命令
 */
function execCmdCurrentSession(row: CmdNode) {
  try {
    data.current_host.ws.send(row.cmd_data + "\n");
  } catch (e) {
    ElMessage.error("当前会话执行命令失败");
  }
}

/**
 * 在所有会话执行收藏命令
 */
function execCmdAllSession(row: CmdNode) {
  try {
    if (data.host_tabs.length === 0) {
      ElMessage.error("没有连接会话");
      return;
    }
    data.host_tabs.forEach((h) => {
      h.ws.send(row.cmd_data + "\n");
    });
  } catch (e) {
    ElMessage.error("执行命令失败");
  }
}

/**
 * 添加密钥文件
 */
function addCertFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.addEventListener("change", (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      let certFile = files[0];
      const isLt1M = certFile.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        ElMessage.error("上传文件大小不能超过 1MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        data.cert_data = (e.target as FileReader).result as string;
      };
      reader.readAsText(certFile);
    }
  });
  input.click();
}

/**
 * 验证输入的主机信息
 */
function verifyFrom(): VerifyFromData {
  let verifyFromData: VerifyFromData = {
    host: {} as Host,
    is_success: false,
  };

  if (data.name.length === 0) {
    ElMessage.error("名称不能为空");
    return verifyFromData;
  }

  if (data.name.length > 30) {
    ElMessage.error("名称不能大于30个字符");
    return verifyFromData;
  }

  if (data.address.length === 0) {
    ElMessage.error("主机不能为空");
    return verifyFromData;
  }

  if (data.address.length > 60) {
    ElMessage.error("主机不能大于60个字符");
    return verifyFromData;
  }

  if (data.user.length === 0) {
    ElMessage.error("用户名不能为空");
    return verifyFromData;
  }

  if (data.user.length > 60) {
    ElMessage.error("用户名不能大于60个字符");
    return verifyFromData;
  }

  if (data.user.length === 0) {
    ElMessage.error("用户名不能为空");
    return verifyFromData;
  }

  if (data.user.length > 60) {
    ElMessage.error("用户名不能大于60个字符");
    return verifyFromData;
  }

  if (data.auth_type === "pwd" && data.pwd.length === 0) {
    ElMessage.error("密码不能为空");
    return verifyFromData;
  }

  if (data.user.length > 60) {
    ElMessage.error("密码不能大于60个字符");
    return verifyFromData;
  }

  if (!data.port) {
    ElMessage.error("端口输入错误,必须是1-65535");
    return verifyFromData;
  }

  if (data.port < 1 || data.port > 65535) {
    ElMessage.error("端口范围错误,必须是1-65535");
    return verifyFromData;
  }

  if (data.auth_type === "cert" && data.cert_data === "") {
    ElMessage.error("使用密钥登陆,密钥内容不能为空");
    return verifyFromData;
  }

  let h = {
    id: data.id,
    name: data.name,
    address: data.address,
    user: data.user,
    auth_type: data.auth_type,
    net_type: data.net_type,
    cert_data: data.cert_data,
    cert_pwd: data.cert_pwd,
    pwd: data.pwd,
    port: data.port,
    session_id: data.session_id,
    background: data.background,
    foreground: data.foreground,
    cursor_color: data.cursor_color,
    font_family: data.font_family,
    font_size: data.font_size,
    cursor_style: data.cursor_style,
    shell: data.shell,
    pty_type: data.pty_type,
    init_cmd: data.init_cmd,
    init_banner: data.init_banner,
  };
  let result: VerifyFromData = {
    host: h as Host,
    is_success: true,
  };
  return result;
}

/**
 * 清空表单数据
 */
function cleanFrom() {
  data.id = 0;
  data.name = "";
  data.address = "";
  data.user = "";
  data.pwd = "";
  data.auth_type = "pwd";
  data.net_type = "tcp4";
  data.cert_data = "";
  data.cert_pwd = "";
  data.port = 22;
  data.session_id = "";
  data.background = "#000000";
  data.foreground = "#FFFFFF";
  data.cursor_color = "#FFFFFF";
  data.font_family = "Courier";
  data.font_size = 16;
  data.cursor_style = "block";
  data.shell = "bash";
  data.pty_type = "xterm-256color";
  data.init_cmd = "";
  data.init_banner = "";
  data.host_config_collapse = ['1'];
}

/**
 * 连接
 */
function connect() {
  let result = verifyFrom();
  if (!result.is_success) {
    return;
  }
  connectHost(result.host);
}

/**
 * 打开文件列表
 */
function listDir(dir: string, h: Host) {
  data.file_dialog_visible = true;
  if (h) {
    setCurrentAcitveHost(h.session_id);
  }
  let host = { ...data.current_host };

  if (!host.hasOwnProperty("session_id")) {
    // 没有连接主机
    return;
  }

  let formData = new FormData();
  formData.append("session_id", host.session_id);
  formData.append("path", dir);
  axios.post<ResponseData>("/api/sftp/list", formData).then((ret) => {
    if (ret.data.code === 0) {
      data.dir_info = ret.data.data;
      data.sftp_current_dir = dir;
    } else {
      ElMessage.error("获取文件列表错误");
    }
  });
}

/**
 * 上传文件
 */
function uploadFile(path: string) {
  data.sftp_upload_percentage = 0;
  function upload(fileList: FileList) {
    let formData = new FormData();
    formData.append("session_id", data.current_host.session_id);
    formData.append("path", path);
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]);
    }

    axios({
      url: '/api/sftp/upload',
      method: 'put',
      data: formData,
      //上传进度
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const { loaded, total } = progressEvent;
        if (!total) {
          // 没有获取到总大小，可能是流式上传或者chunked传输
          data.sftp_upload_percentage = loaded;
        } else {
          // 计算进度，可以用 loaded / total 得到一个0到1的数字
          data.sftp_upload_percentage = loaded / total * 100 | 0;
        }
      }
    }).then((ret) => {
      if (ret.data.code === 0) {
        // ElMessage.success(ret.data.msg);
        listDir(data.sftp_current_dir, data.current_host);
        let list = ret.data.data as Array<string>;
        if (list) {
          let msg = "";
          list.forEach((i) => {
            msg += `<p>${i}</p>`;
          });
          ElNotification({
            type: 'success',
            duration: 7000,
            title: ret.data.msg,
            dangerouslyUseHTMLString: true,
            message: msg,
          });
        }
      } else {
        ElMessage.error("上传失败");
      }
    }).catch(() => {
      ElMessage.error("上传异常");
    });
  }

  let fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.multiple = true;

  fileInput.onchange = function (f: any) {
    let fileList = fileInput.files as FileList;
    upload(fileList);
  };
  fileInput.click();
}

/**
 * 下载文件(只能是文件,不能是目录)
 */
function downloadFile(file: FileInfo) {
  /*
  // POST 方式
  let formData = new FormData();
  formData.append("session_id", data.current_host.session_id);
  formData.append("path", file.path);
  axios.post<Blob>("/api/sftp/download", formData).then((ret) => {
    let blob = new Blob([ret.data], { type: 'application/x-download' });
    let a = document.createElement("a");
    a.style.display = 'none';
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); 
    window.URL.revokeObjectURL(url);
  });
  */
  let reqUrl = `/api/sftp/download?Authorization=${localStorage.getItem("token")}&session_id=${data.current_host.session_id}&path=${encodeURIComponent(file.path).replace(/%/g, "%25")}`;
  let a = document.createElement("a");
  a.style.display = 'none';
  a.href = reqUrl;
  a.download = file.name;
  a.click();
}

/**
 * SFTP文件删除
 */
function deleteFile(file: FileInfo) {
  let body = {
    "session_id": data.current_host.session_id,
    "path": file.path
  }
  axios.delete<ResponseData>("/api/sftp/delete", { data: body }).then((ret) => {
    if (ret.data.code === 0) {
      listDir(data.sftp_current_dir, data.current_host);
      ElMessage.success("删除文件成功");
    } else {
      ElMessage.error("删除文件出错了");
    }
  });
}

/**
 * SFTP创建目录
 */
function createDir(dir: string, h: Host) {
  let body = {
    "session_id": h.session_id,
    "path": dir
  }
  axios.post<ResponseData>("/api/sftp/create_dir", body).then((ret) => {
    if (ret.data.code === 0) {
      listDir(data.sftp_current_dir, data.current_host);
      ElMessage.success("创建目录成功");
    } else {
      ElMessage.error("创建目录出错了");
    }
  });
}

/**
 * 获取所有主机列表
 */
function getAllHost() {
  axios.get<ResponseData>("/api/conn_conf").then((ret) => {
    if (ret.data.code === 0) {
      data.host_list = ret.data.data;
    } else {
      ElMessage.error("获取主机列表错误");
    }
  })
}

/**
 * 创建或更新主机
 */
function createOrUpdateHost(host: Host, m: Mode) {
  // 关闭模态框,from 表单验证后续在搞 :rules="host_from_rules"
  if (m == 0) {
    for (let i = 0; i < data.host_list.length; i++) {
      // 数据库中name是unique约束
      let item = data.host_list[i];
      if (item.name == host.name) {
        ElMessage.error("名称已经存在,请修改");
        return;
      }
    }
  }

  // 关闭模态框
  data.host_dialog_visible = false;
  if (m == 0) {
    // 新增
    axios.post<ResponseData>("/api/conn_conf", host)
      .then((ret) => {
        if (ret.data.code === 0) {
          data.host_list = ret.data.data;
          cleanFrom();
        } else {
          ElMessage.error("新增出错了");
        }
      })
  } else {
    // 更新
    axios.put<ResponseData>(`/api/conn_conf`, host)
      .then((ret) => {
        if (ret.data.code === 0) {
          data.host_list = ret.data.data;
          cleanFrom();
        }
        else {
          ElMessage.error("更新出错了");
        }
      })
  }
}

/**
 * 进入主机创建模式
 */
function newHost() {
  cleanFrom();
  data.host_dialog_visible = true;
  data.mode = 0;
}

/**
 * 创建主机并保存(也可以创建主机并保存且保存)
 */
function createHost(isConnect: boolean = false) {
  // 创建模式
  data.mode = Mode.create;
  let result = verifyFrom();
  if (!result.is_success) {
    return;
  }
  createOrUpdateHost(result.host, Mode.create);
  if (isConnect) {
    connectHost(result.host);
  }
}

/**
 * 编辑主机
 */
function editHost(row: Host) {
  // 打开模态框
  data.host_dialog_visible = true;

  // 编辑模式
  data.mode = Mode.update;
  data.id = row.id;
  data.address = row.address;
  data.name = row.name;
  data.user = row.user;
  data.auth_type = row.auth_type;
  data.net_type = row.net_type;
  data.cert_data = row.cert_data;
  data.cert_pwd = row.cert_pwd;
  data.pwd = row.pwd;
  data.port = row.port;
  data.background = row.background;
  data.foreground = row.foreground;
  data.cursor_color = row.cursor_color;
  data.font_family = row.font_family;
  data.font_size = row.font_size;
  data.cursor_style = row.cursor_style;
  data.shell = row.shell;
  data.pty_type = row.pty_type;
  data.init_cmd = row.init_cmd;
  data.init_banner = row.init_banner;
  data.host_config_collapse = ['1'];
}

/**
 * 更新主机信息
 */
function updateHost(isConnect: boolean = false) {
  let result = verifyFrom();
  if (!result.is_success) {
    return;
  }
  createOrUpdateHost(result.host, Mode.update);
  if (isConnect) {
    connectHost(result.host);
  }
}

/**
 * 删除已经保存的主机
 */
function deleteHost(row: any) {
  axios.delete<ResponseData>(`/api/conn_conf/${row.id}`)
    .then((ret) => {
      if (ret.data.code === 0) {
        data.host_list = ret.data.data;
        cleanFrom();
      } else {
        ElMessage.error("删除主机出错了");
      }
    });
}

/**
 * 去掉几个引用对象属性
 * @param data 
 */
function getHost(data: Host): Omit<Host, 'fit' | 'term' | 'ws' | 'is_close'> {
  if (data.term) {
    try {
      data.fit.dispose();
      data.term.dispose();
      data.ws.close();
    } catch (err) {
      console.log("清理资源错误:" + err);
    }
  }

  let connectTabElement = document.getElementById(data.session_id);
  if (connectTabElement) {
    connectTabElement.innerHTML = "";
  }

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    user: data.user,
    auth_type: data.auth_type,
    net_type: data.net_type,
    cert_data: data.cert_data,
    cert_pwd: data.cert_pwd,
    pwd: data.pwd,
    port: data.port,
    session_id: data.session_id,
    background: data.background,
    foreground: data.foreground,
    cursor_color: data.cursor_color,
    font_family: data.font_family,
    font_size: data.font_size,
    cursor_style: data.cursor_style,
    shell: data.shell,
    pty_type: data.pty_type,
    init_cmd: data.init_cmd,
    init_banner: data.init_banner,
  };
}

/**
 * 连接已经保存过的主机
 */
function connectHost(host: Host, isReconnect: boolean = false) {
  // 关闭新增/编辑主机弹窗
  data.host_dialog_visible = false;

  // 关闭主机管理弹窗
  data.modify_devices_dialog_visible = false;

  let requestUrl = "/api/ssh/create_session";
  // 如果重连,在url加上会话ID
  if (isReconnect) {
    requestUrl += `?session_id=${host.session_id}`;
  }

  // 上一个版本的解包
  let connHost = getHost(host) as Host;
  axios.post<ResponseData>(requestUrl, connHost)
    .then((ret) => {
      if (ret.data.code === 0) {
        let session_id = ret.data.data;
        connHost.session_id = session_id;

        // 窗口大小适应插件
        connHost.fit = new FitAddon();

        connHost.term = new Terminal({
          cursorBlink: true,
          theme: {
            background: connHost.background,
            foreground: connHost.foreground,
            cursor: connHost.cursor_color,
          },
          fontSize: connHost.font_size,
          fontFamily: connHost.font_family,
          cursorStyle: connHost.cursor_style,
        });

        // 加载窗口大小自适应插件
        connHost.term.loadAddon(connHost.fit);

        // 如果是重连就不需要再建立tab页面,直接替换
        if (isReconnect) {
          for (let [index, h] of data.host_tabs.entries()) {
            if (h.session_id === session_id) {
              connHost.is_close = false;
              data.host_tabs[index] = connHost;
              break;
            }
          }
        } else {
          // 新连接添加tab 页面
          data.host_tabs.push(connHost);
        }

        nextTick(() => {
          let connectTabElement = document.getElementById(connHost.session_id);

          if (connectTabElement === null) {
            ElMessage.error("创建连接获取dom为空!");
            return;
          }

          const headerHeight = data.navCollapsed ? 0 : 70;
          connectTabElement.style.height = Math.floor(window.innerHeight - headerHeight) + "px";
          connHost.term.open(connectTabElement);
          connHost.fit.fit();

          const c = connHost.term.cols > 40 ? connHost.term.cols : 40
          const r = connHost.term.rows > 40 ? connHost.term.rows : 40

          let param = `h=${r}&w=${c}&session_id=${connHost.session_id}&Authorization=${localStorage.getItem("token")}`;
          let headPart = `${location.protocol == "http:" ? "ws://" : "wss://"}${location.host}`;
          let tailPart = `/api/ssh/conn?${param}`;

          let basePath = window.location.pathname.replace("/app/", "");
          if (import.meta.env.VITE_ROUTE_MODE === "WebHistory") {
            if (import.meta.env.VITE_WEB_BASE_DIR) {
              basePath = `${import.meta.env.VITE_WEB_BASE_DIR}`;
            } else {
              basePath = "";
            }
          }

          let webSockerUrl = `${headPart}${basePath}${tailPart}`;

          let ws = new WebSocket(webSockerUrl);
          ws.onopen = function () {
            try {
              // 初始化benner
              let bannerStr = connHost.init_banner.trim();
              if (bannerStr !== "") {
                connHost.term.writeln(bannerStr);
              }

              // 调整窗口大小
              windowResize();

              // 初始化命令
              let cmdStr = connHost.init_cmd.trim()
              if (cmdStr !== "") {
                ws.send(`${cmdStr}\n`)
              }
            } catch (err) {
              console.log(err);
            }
          }

          ws.onerror = function (err) {
            console.log("WebSocket error");
            connHost.term.writeln("##  连接出错,请重连!  ##");
          }

          ws.onclose = function () {
            console.log("WebSocket close:" + connHost.session_id);
            connHost.term.writeln("##  连接关闭,请重连!  ##");
            connHost.is_close = true;
            if (data.current_host.session_id === session_id) {
              data.current_host.is_close = true;
            }
          }

          connHost.term.attachCustomKeyEventHandler((event: KeyboardEvent) => {
            if (event.type === "keydown" && event.ctrlKey && event.key.toLowerCase() === "c") {
              if (connHost.term.hasSelection()) {
                return false;
              }
              if (ws.readyState === WebSocket.OPEN) {
                ws.send("\x03");
              }
              return false;
            }
            return true;
          });

          connHost.term.loadAddon(new AttachAddon(ws));
          connHost.ws = ws;
          connHost.is_close = false;
          connHost.term.focus();
          // 清空 from 表单数据
          cleanFrom();

          // 设置当前激活的host
          data.current_host = { ...connHost };
        });
      } else {
        ElMessage.error("创建连接出错了");
      }
    }).catch((err) => {
      ElMessage.error("创建会话出错了");
      console.log(err)
    });
}

/**
 * 删除tab
 */
function removeTab(tabId: string | number) {
  try {
    axios.post(`/api/ssh/disconnect?session_id=${tabId}`);
  } catch (error) {
    console.log(error);
  }

  let removeIndex = 0;
  for (let [index, h] of data.host_tabs.entries()) {
    if (h.session_id === String(tabId)) {
      removeIndex = index;
      break;
    }
  }

  // 销毁term 对象
  data.host_tabs[removeIndex].fit.dispose();
  data.host_tabs[removeIndex].term.dispose();
  data.host_tabs[removeIndex].ws.close();

  // 从tab页签中删除
  data.host_tabs.splice(removeIndex, 1);

  // 如果没有打开的tab页签,就直接返回
  if (data.host_tabs.length === 0) {
    return;
  }

  // 如果打开的tab页签只有一个,就把这个tab页签设置成激活状态
  if (data.host_tabs.length === 1) {
    let activeHost = { ...data.host_tabs[0] };
    setCurrentAcitveHost(activeHost.session_id);
    return;
  }

  // 如果打开的tab页签只有一个以上,删除以后把下一个tab页签设置成激活
  if (data.host_tabs.length > 1) {
    let activeHost = { ...data.host_tabs[removeIndex - 1] };
    setCurrentAcitveHost(activeHost.session_id);
  }
}

/***
 * 点击切换tab
 */
function selectTab(tab: any) {
  let sessionId = tab.props.name;
  if (data.current_host.session_id === sessionId) {
    // 激活的已经是当前窗口直接返回
    return;
  }
  setCurrentAcitveHost(sessionId);
}

/**
 * 设置当前正在使用的主机
 */
function setCurrentAcitveHost(sessionId: string) {
  for (const host of data.host_tabs) {
    if (host.session_id === sessionId) {
      data.current_host = { ...host };
      break;
    }
  }
  windowResize();
}

/**
 * 更改窗口大小
 */
function windowResize() {
  let currentHost = data.current_host;
  if (currentHost.session_id === "") {
    return;
  }
  // 没有在主机连接路由页面
  if (router.currentRoute.value.name !== "Home") {
    return;
  }
  nextTick(() => {
    let connectTabElement = document.getElementById(currentHost.session_id);
    if (connectTabElement === null) {
      console.log("调整窗口大小,没有获取到dom");
      return;
    }
    const headerHeight = data.navCollapsed ? 0 : 70;
    (connectTabElement as HTMLElement).style.height = Math.floor(window.innerHeight - headerHeight) + "px";

    currentHost.fit.fit();
    //if (data.h !== currentHost.term.rows || data.w !== currentHost.term.cols) {
    let url = `/api/ssh/conn?w=${currentHost.term.cols}&h=${currentHost.term.rows}&session_id=${currentHost.session_id}`;
    axios.patch<ResponseData>(url)
    //}

    data.h = Math.floor(currentHost.term.rows);
    data.w = Math.floor(currentHost.term.cols);
  });
}

/**
 * 报告连接状态
 */
function reportConnectStatus() {
  statusSetInterval = setInterval(() => {
    let fm = new FormData();
    data.host_tabs.forEach((hont) => {
      fm.append("ids", hont.session_id);
    });
    axios.put<ResponseData>("/api/conn_manage/refresh_conn_time", fm)
      .then((res) => {
        if (res.data.code !== 0) {
          console.log("刷新失败");
        }
      });
  }, 10000);
}

/**
 * 跳转到管理页面
 */
function toManage() {
  //router.push({ name: "Manage" });
  data.manage_dialog_visible = true;
}

/**
 * 防抖
 * @param fn 
 * @param delay 
 */
function debounce(fn: Function, delay: number) {
  let timer = 0;
  return function (event: Event) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, delay)
  }
}

/**
 * 节流
 * @param fn 
 * @param delay 
 */
function throttle(fn: Function, delay: number) {
  let record = Date.now();
  return function (event: Event) {
    let now = Date.now();
    if (now - record > delay) {
      fn();
      record = now;
    }
  }
}

/**
 * 断开所有会话
 */
function disconnectAllSession() {
  // 清理连接资源
  data.host_tabs.forEach((host, index) => {
    try {
      axios.post(`/api/ssh/disconnect?session_id=${host.session_id}`);
    } catch (error) {
      console.log(error);
    }
  });
}

/**
 * 退出登陆
 */
// function logout() {
//   disconnectAllSession();
//   globalStore.logout();
//   localStorage.setItem("auth", "no");
//   router.push({ "name": "Login" });
// }
/**
 * 退出登录（保留记住密码）
 */
function logout() {
  // 1. 断开所有连接
  disconnectAllSession();

  // 2. 清空内存态
  // globalStore.logout();

  // 3. 清除登录凭证
  localStorage.removeItem("token");
  localStorage.setItem("auth", "no");

  // 4. 关闭自动登录（但不清记住密码）
  disableAutoLogin();

  // 5. 跳转登录页
  router.replace({ name: "Login" });
}

function disableAutoLogin() {
  const raw = localStorage.getItem("login_account");
  if (!raw) return;
  try {
    const account = JSON.parse(raw);
    account.autoLogin = false;
    localStorage.setItem("login_account", JSON.stringify(account));
  } catch {
    // 如果解析失败，直接清掉
    localStorage.removeItem("login_account");
  }
}

/**
 * 挂载后执行
 */
onMounted(() => {
  router = useRouter();
  reportConnectStatus();
  getAllHost();
  getAllCmdNote();
  window.addEventListener("resize", debounce(windowResize, 200));
  window.addEventListener("resize", updateWindowWidth);
  windowResize();
  window.onbeforeunload = function () {
    return "关闭吗";
  };
  // 登录后静默检查更新（延迟一下避免阻塞首屏渲染）
  setTimeout(() => { silentCheckUpdate(); }, 1500);
});


/**
 * 销毁前执行
 */
onBeforeUnmount(() => {
  clearInterval(statusSetInterval);
  disconnectAllSession();
  window.removeEventListener("resize", updateWindowWidth);
  window.onbeforeunload = null;
})

// 添加计算属性获取终端背景色
const terminalBackground = computed(() => {
  if (data.current_host?.term?.options?.theme?.background) {
    return data.current_host.term.options.theme.background;
  }
  return data.background || '#000000';
});

// 用于 Main.vue 包装器的主题背景样式
const mainBgStyle = computed(() => {
  let bg = `linear-gradient(135deg, 
    hsl(${themeStore.hue}, ${Math.round(themeStore.saturation * 100)}%, 28%) 0%, 
    hsl(${themeStore.hue}, ${Math.round(themeStore.saturation * 80)}%, 38%) 50%, 
    hsl(${themeStore.hue}, ${Math.round(themeStore.saturation * 70)}%, 50%) 100%)`;
  if (themeStore.backgroundEnabled && themeStore.backgroundUrl) {
    bg = `url(${themeStore.backgroundUrl}), ${bg}`;
  }
  return {
    background: bg,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };
});

</script>


<style scoped>
.top-nav-header {
  position: relative;
  height: fit-content;
  padding: 8px 12px 10px;
  background: linear-gradient(135deg,
    hsl(calc(var(--theme-primary-h, 201) * 1), var(--theme-primary-s, 100%), 28%),
    hsl(calc(var(--theme-primary-h, 201) * 1), calc(var(--theme-primary-s, 100%) * 0.8), 38%));
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(var(--theme-blur-rate, 14px));
  overflow: visible;
  z-index: 2000;
}

.nav {
  display: flex;
  align-items: center;
}

.nav :deep(.el-button) {
  border: none;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  box-shadow: none;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.nav :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.24);
  transform: translateY(var(--theme-hover-y, -1px));
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
}

.el-button-group {
  display: flex;
  max-width: 100%;
}

.nav :deep(.el-button-group) {
  display: flex;
  gap: 10px;
}

.nav :deep(.el-button-group > .el-button:not(:first-child)) {
  margin-left: 0;
}

.nav-anchor-toggle {
  position: absolute;
  left: 50%;
  width: 45px;
  height: 15px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-top: none;
  border-radius: 0 0 20px 20px;
  transform: translateX(-50%);
  background: linear-gradient(135deg,
    hsl(calc(var(--theme-primary-h, 201) * 1), var(--theme-primary-s, 100%), 28%),
    hsl(calc(var(--theme-primary-h, 201) * 1), calc(var(--theme-primary-s, 100%) * 0.8), 38%));
  color: #e2e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(var(--theme-blur-rate, 16px));
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

@media (prefers-color-scheme: dark) {
  .top-nav-header {
    background: linear-gradient(135deg,
      hsl(calc(var(--theme-primary-h, 201) * 1), var(--theme-primary-s, 100%), 20%),
      hsl(calc(var(--theme-primary-h, 201) * 1), calc(var(--theme-primary-s, 100%) * 0.8), 30%));
  }
  .nav-anchor-toggle {
    background: linear-gradient(135deg,
      hsl(calc(var(--theme-primary-h, 201) * 1), var(--theme-primary-s, 100%), 20%),
      hsl(calc(var(--theme-primary-h, 201) * 1), calc(var(--theme-primary-s, 100%) * 0.8), 30%));
  }
  
}
@media (prefers-color-scheme: dark) {
  .nav-toggle-closed {
    background: linear-gradient(135deg,
      hsl(calc(var(--theme-primary-h, 201) * 1), var(--theme-primary-s, 100%), 16%),
      hsl(calc(var(--theme-primary-h, 201) * 1), calc(var(--theme-primary-s, 100%) * 0.8), 26%));
  }
}
.nav-anchor-toggle-open {
  top: 50px;
}

/* 折叠状态展开按钮 - 固定在页面顶部居中 */
.nav-toggle-closed {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 52px;
  height: 16px;
  border: 1px solid rgba(255,255,255,0.2);
  border-top: none;
  border-radius: 0 0 14px 14px;
  background: linear-gradient(135deg,
    hsl(calc(var(--theme-primary-h, 201) * 1), var(--theme-primary-s, 100%), 28%),
    hsl(calc(var(--theme-primary-h, 201) * 1), calc(var(--theme-primary-s, 100%) * 0.8), 38%));
  color: rgba(255,255,255,0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(var(--theme-blur-rate, 10px));
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: 0.85;
}

.nav-toggle-closed:hover {
  opacity: 1;
  height: 20px;
  transform: translateX(-50%) translateY(0);
}

.nav-toggle-closed .el-icon {
  font-size: 13px;
  line-height: 1;
}

.nav-anchor-icon {
  width: 25px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-anchor-toggle .el-icon {
  font-size: 15px;
}

:deep(.modern-dialog) {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(248, 250, 252, 0.96);
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.28),
    0 0 0 1px rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(18px);
}

:deep(.modern-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 18px 22px 14px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.04)),
    rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

:deep(.modern-dialog .el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.2px;
}

:deep(.modern-dialog .el-dialog__headerbtn) {
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

:deep(.modern-dialog .el-dialog__headerbtn:hover) {
  background: rgba(15, 23, 42, 0.08);
  transform: rotate(90deg);
}

:deep(.modern-dialog .el-dialog__body) {
  padding: 18px 22px;
  color: #334155;
}

:deep(.modern-dialog .el-dialog__footer) {
  padding: 14px 22px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(248, 250, 252, 0.72);
}

:deep(.modern-dialog .el-input__wrapper),
:deep(.modern-dialog .el-textarea__inner),
:deep(.modern-dialog .el-select__wrapper),
:deep(.modern-dialog .el-input-number .el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.22) inset;
  background: rgba(255, 255, 255, 0.88);
  transition:
    box-shadow 0.18s ease,
    background 0.18s ease;
}

:deep(.modern-dialog .el-input__wrapper:hover),
:deep(.modern-dialog .el-textarea__inner:hover),
:deep(.modern-dialog .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.42) inset;
}

:deep(.modern-dialog .el-input__wrapper.is-focus),
:deep(.modern-dialog .el-select__wrapper.is-focused) {
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.75) inset,
    0 0 0 4px rgba(59, 130, 246, 0.12);
}

:deep(.modern-dialog .el-form-item__label) {
  color: #475569;
  font-weight: 600;
}
:deep(.modern-dialog .el-table) {
  border-radius: 16px;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.14);
}

:deep(.modern-dialog .el-table th.el-table__cell) {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}

:deep(.modern-dialog .el-table td.el-table__cell) {
  border-bottom-color: rgba(226, 232, 240, 0.9);
}

:deep(.modern-dialog .el-table__row:hover > td.el-table__cell) {
  background: rgba(59, 130, 246, 0.06);
}

:deep(.modern-dialog .el-table__inner-wrapper::before) {
  display: none;
}
:deep(.modern-dialog .el-collapse) {
  border: none;
}

:deep(.modern-dialog .el-collapse-item) {
  margin-bottom: 14px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.16);
}

:deep(.modern-dialog .el-collapse-item__header) {
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background:
    linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(255, 255, 255, 0.7));
  color: #0f172a;
  font-weight: 700;
}

:deep(.modern-dialog .el-collapse-item__wrap) {
  border-bottom: none;
  background: transparent;
}

:deep(.modern-dialog .el-collapse-item__content) {
  padding: 18px 16px 4px;
}
:deep(.modern-dialog .el-button) {
  border-radius: 12px;
  font-weight: 600;
}

:deep(.modern-dialog .el-button--primary) {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border: none;
}

:deep(.modern-dialog .el-button--success) {
  background: linear-gradient(135deg, #059669, #10b981);
  border: none;
}

:deep(.modern-dialog .el-button--danger) {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border: none;
}

:deep(.modern-dialog .el-button:hover) {
  transform: translateY(var(--theme-hover-y, -1px));
}
@media (max-width: 768px) {
  .nav .right {
    text-align: left !important;
  }

  :deep(.modern-dialog) {
    border-radius: 0;
  }

  :deep(.modern-dialog .el-dialog__body) {
    padding: 14px;
  }

  :deep(.modern-dialog .el-dialog__footer) {
    padding: 12px 14px 16px;
  }

  .nav :deep(.el-button-group) {
    display: flex;
    gap: 6px;
  }
  .el-button {
    font-size: 10px;
    padding: 0px 11px;
  }

}

/* 终端自适应 */
:deep(.el-tabs__header) {
  margin: 0 !important;
}

/* 更新界面样式 */
.version-info-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(255, 255, 255, 0.9));
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.16);
}

.version-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.version-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.version-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.version-value.highlight {
  color: #2563eb;
}

.version-arrow {
  font-size: 24px;
  color: #3b82f6;
  font-weight: 300;
}

.update-file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(248, 250, 252, 0.9);
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.12);
}

.update-file-info .file-name {
  font-size: 13px;
  color: #334155;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.update-file-info .file-size {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.update-progress-content {
  padding: 8px 0;
}

/* 进度对话框样式 */
.update-progress-dialog {
  --progress-primary: #3b82f6;
  --progress-success: #10b981;
  --progress-danger: #ef4444;
  --progress-warning: #f59e0b;
  --progress-cancelled: #f59e0b;
}

/* 进度条区域 */
.progress-bar-section {
  margin-bottom: 20px;
}

.progress-bar-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.progress-bar-track {
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-bar-fill.downloading {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.progress-bar-fill.success {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-bar-fill.failed {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-bar-fill.cancelled {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-bar-fill.restarting {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.progress-bar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-percent-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.progress-size-info {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* 状态消息 */
.progress-status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}

.progress-status-message.downloading {
  background: #eff6ff;
  color: #3b82f6;
}

.progress-status-message.success {
  background: #ecfdf5;
  color: #10b981;
}

.progress-status-message.failed {
  background: #fef2f2;
  color: #ef4444;
}

.progress-status-message.cancelled {
  background: #fffbeb;
  color: #f59e0b;
}

.progress-status-message.restarting {
  background: #f5f3ff;
  color: #8b5cf6;
}

/* 详细信息表格 */
.progress-info-table {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.info-table-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.info-table-row:last-child {
  border-bottom: none;
}

.info-table-label {
  width: 80px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  flex-shrink: 0;
}

.info-table-value {
  flex: 1;
  font-size: 13px;
  color: #1e293b;
  font-weight: 600;
}

.info-table-value.speed {
  color: #3b82f6;
}

.info-table-value.filename {
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
}

.info-table-value.sha256 {
  word-break: break-all;
  font-family: monospace;
  font-size: 11px;
  color: #64748b;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .progress-bar-track {
    height: 20px;
  }

  .progress-percent-text {
    font-size: 12px;
  }

  .info-table-row {
    padding: 10px 12px;
  }

  .info-table-label {
    width: 70px;
    font-size: 12px;
  }

  .info-table-value {
    font-size: 12px;
  }
}
</style>
