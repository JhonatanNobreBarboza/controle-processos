// Configuração inicial do projeto Vue.js
const { createApp } = Vue;

// Componente de Login
const LoginComponent = {
  template: `
    <div class="login-container">
      <div class="card">
        <h2 class="card-title">Login</h2>
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" v-model="password" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Entrar</button>
          </div>
          <div class="form-links">
            <a href="#" @click.prevent="showRegister">Cadastrar-se</a> | 
            <a href="#" @click.prevent="showForgotPassword">Esqueceu a senha?</a>
          </div>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login() {
      // Implementação do login
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          this.$emit('login-success');
        } else {
          alert('Credenciais inválidas');
        }
      })
      .catch(error => {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login');
      });
    },
    showRegister() {
      this.$emit('show-register');
    },
    showForgotPassword() {
      this.$emit('show-forgot-password');
    }
  }
};

// Componente de Registro
const RegisterComponent = {
  template: `
    <div class="register-container">
      <div class="card">
        <h2 class="card-title">Cadastro</h2>
        <form @submit.prevent="register">
          <div class="form-group">
            <label for="name">Nome</label>
            <input type="text" id="name" v-model="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" v-model="password" required>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmar Senha</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Cadastrar</button>
            <button type="button" class="btn btn-secondary" @click="showLogin">Voltar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    register() {
      if (this.password !== this.confirmPassword) {
        alert('As senhas não coincidem');
        return;
      }
      
      // Implementação do registro
      fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          password: this.password
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          alert('Cadastro realizado com sucesso! Faça login para continuar.');
          this.showLogin();
        } else {
          alert(data.message || 'Erro ao cadastrar');
        }
      })
      .catch(error => {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao cadastrar');
      });
    },
    showLogin() {
      this.$emit('show-login');
    }
  }
};

// Componente de Recuperação de Senha
const ForgotPasswordComponent = {
  template: `
    <div class="forgot-password-container">
      <div class="card">
        <h2 class="card-title">Recuperação de Senha</h2>
        <form @submit.prevent="requestReset">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Enviar</button>
            <button type="button" class="btn btn-secondary" @click="showLogin">Voltar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      email: ''
    }
  },
  methods: {
    requestReset() {
      // Implementação da recuperação de senha
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email
        })
      })
      .then(response => response.json())
      .then(data => {
        alert('Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.');
        this.showLogin();
      })
      .catch(error => {
        console.error('Erro ao solicitar recuperação de senha:', error);
        alert('Erro ao solicitar recuperação de senha');
      });
    },
    showLogin() {
      this.$emit('show-login');
    }
  }
};

// Componente principal de autenticação
const AuthComponent = {
  template: `
    <div class="auth-container">
      <component :is="currentComponent" 
        @show-login="currentComponent = 'login'"
        @show-register="currentComponent = 'register'"
        @show-forgot-password="currentComponent = 'forgot-password'"
        @login-success="$emit('login-success')">
      </component>
    </div>
  `,
  data() {
    return {
      currentComponent: 'login'
    }
  },
  components: {
    'login': LoginComponent,
    'register': RegisterComponent,
    'forgot-password': ForgotPasswordComponent
  }
};

// Componente de listagem de processos
const ProcessListComponent = {
  template: `
    <div class="process-list-container">
      <div class="filters">
        <div class="form-group">
          <label for="status-filter">Status</label>
          <select id="status-filter" v-model="statusFilter">
            <option value="">Todos</option>
            <option v-for="status in statusList" :value="status.id">{{ status.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="responsible-filter">Responsável</label>
          <select id="responsible-filter" v-model="responsibleFilter">
            <option value="">Todos</option>
            <option v-for="responsible in responsibleList" :value="responsible.id">{{ responsible.name }}</option>
          </select>
        </div>
        <button class="btn btn-primary" @click="applyFilters">Filtrar</button>
        <button class="btn btn-secondary" @click="resetFilters">Limpar</button>
      </div>
      
      <div class="actions">
        <button class="btn btn-success" @click="showNewProcess">Novo Processo</button>
      </div>
      
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>SD</th>
              <th>Data Abertura</th>
              <th>Objeto Simplificado</th>
              <th>Modalidade</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="process in processes" :key="process.id">
              <td>{{ process.sd_number }}</td>
              <td>{{ formatDate(process.opening_date) }}</td>
              <td>{{ process.simplified_object }}</td>
              <td>{{ process.modality }}</td>
              <td>{{ process.responsible_name }}</td>
              <td>{{ process.status_name }}</td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewProcess(process.id)">Ver</button>
                <button class="btn btn-sm btn-primary" @click="editProcess(process.id)">Editar</button>
                <button class="btn btn-sm btn-warning" @click="showStatusUpdate(process)">Status</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="processes.length === 0" class="no-data">
        Nenhum processo encontrado.
      </div>
    </div>
  `,
  data() {
    return {
      processes: [],
      statusList: [],
      responsibleList: [],
      statusFilter: '',
      responsibleFilter: ''
    }
  },
  mounted() {
    this.loadLists();
    this.loadProcesses();
  },
  methods: {
    loadLists() {
      // Carregar lista de status
      fetch('/api/lists/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.statusList = data;
      })
      .catch(error => {
        console.error('Erro ao carregar status:', error);
      });
      
      // Carregar lista de responsáveis
      fetch('/api/lists/responsibles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.responsibleList = data;
      })
      .catch(error => {
        console.error('Erro ao carregar responsáveis:', error);
      });
    },
    loadProcesses() {
      let url = '/api/processes';
      const params = [];
      
      if (this.statusFilter) {
        params.push(`status=${this.statusFilter}`);
      }
      
      if (this.responsibleFilter) {
        params.push(`responsible=${this.responsibleFilter}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.processes = data;
      })
      .catch(error => {
        console.error('Erro ao carregar processos:', error);
      });
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    },
    applyFilters() {
      this.loadProcesses();
    },
    resetFilters() {
      this.statusFilter = '';
      this.responsibleFilter = '';
      this.loadProcesses();
    },
    showNewProcess() {
      this.$emit('show-process-form', { isNew: true });
    },
    viewProcess(id) {
      this.$emit('view-process', id);
    },
    editProcess(id) {
      this.$emit('edit-process', id);
    },
    showStatusUpdate(process) {
      this.$emit('update-status', process);
    }
  }
};

// Componente de formulário de processo
const ProcessFormComponent = {
  template: `
    <div class="process-form-container">
      <div class="card">
        <h2 class="card-title">{{ isNew ? 'Novo Processo' : 'Editar Processo' }}</h2>
        <form @submit.prevent="saveProcess">
          <div class="form-group">
            <label for="sd_number">Número SD</label>
            <input type="text" id="sd_number" v-model="process.sd_number">
          </div>
          <div class="form-group">
            <label for="opening_date">Data de Abertura</label>
            <input type="date" id="opening_date" v-model="process.opening_date" required>
          </div>
          <div class="form-group">
            <label for="simplified_object">Objeto Simplificado</label>
            <textarea id="simplified_object" v-model="process.simplified_object" required></textarea>
          </div>
          <div class="form-group">
            <label for="modality">Modalidade</label>
            <input type="text" id="modality" v-model="process.modality">
          </div>
          <div class="form-group">
            <label for="responsible">Responsável</label>
            <select id="responsible" v-model="process.responsible">
              <option value="">Selecione</option>
              <option v-for="responsible in responsibleList" :value="responsible.name">{{ responsible.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="process.status">
              <option value="">Selecione</option>
              <option v-for="status in statusList" :value="status.name">{{ status.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Secretarias Participantes</label>
            <div v-for="(secretary, index) in secretaryList" :key="index" class="checkbox-item">
              <input type="checkbox" :id="'secretary-' + index" :value="secretary.name" v-model="process.participating_secretaries">
              <label :for="'secretary-' + index">{{ secretary.name }}</label>
            </div>
          </div>
          <div class="form-group">
            <label>Fiscais de Contrato</label>
            <div class="supervisor-list">
              <div v-for="(supervisor, index) in process.contract_supervisors" :key="index" class="supervisor-item">
                <input type="text" v-model="process.contract_supervisors[index]">
                <button type="button" class="btn btn-sm btn-danger" @click="removeSupervisor(index)">Remover</button>
              </div>
              <button type="button" class="btn btn-sm btn-secondary" @click="addSupervisor">Adicionar Fiscal</button>
            </div>
          </div>
          <div class="form-group">
            <label for="observations">Observações</label>
            <textarea id="observations" v-model="process.observations"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Salvar</button>
            <button type="button" class="btn btn-secondary" @click="cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  props: {
    processId: {
      type: [Number, String],
      default: null
    },
    isNew: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      process: {
        sd_number: '',
        opening_date: new Date().toISOString().split('T')[0],
        simplified_object: '',
        modality: '',
        responsible: '',
        participating_secretaries: [],
        contract_supervisors: [],
        observations: '',
        status: ''
      },
      statusList: [],
      responsibleList: [],
      secretaryList: []
    }
  },
  mounted() {
    this.loadLists();
    if (!this.isNew && this.processId) {
      this.loadProcess();
    }
  },
  methods: {
    loadLists() {
      // Carregar lista de status
      fetch('/api/lists/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.statusList = data;
      })
      .catch(error => {
        console.error('Erro ao carregar status:', error);
      });
      
      // Carregar lista de responsáveis
      fetch('/api/lists/responsibles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.responsibleList = data;
      })
      .catch(error => {
        console.error('Erro ao carregar responsáveis:', error);
      });
      
      // Carregar lista de secretarias
      fetch('/api/lists/secretaries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.secretaryList = data;
      })
      .catch(error => {
        console.error('Erro ao carregar secretarias:', error);
      });
    },
    loadProcess() {
      fetch(`/api/processes/${this.processId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.process = {
          ...data,
          responsible: data.responsible_name,
          status: data.status_name,
          opening_date: new Date(data.opening_date).toISOString().split('T')[0]
        };
      })
      .catch(error => {
        console.error('Erro ao carregar processo:', error);
      });
    },
    addSupervisor() {
      this.process.contract_supervisors.push('');
    },
    removeSupervisor(index) {
      this.process.contract_supervisors.splice(index, 1);
    },
    saveProcess() {
      const url = this.isNew ? '/api/processes' : `/api/processes/${this.processId}`;
      const method = this.isNew ? 'POST' : 'PUT';
      
      fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(this.process)
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.message || 'Erro ao salvar processo');
        } else {
          alert(data.message || 'Processo salvo com sucesso');
          this.$emit('process-saved');
        }
      })
      .catch(error => {
        console.error('Erro ao salvar processo:', error);
        alert('Erro ao salvar processo');
      });
    },
    cancel() {
      this.$emit('cancel');
    }
  }
};

// Componente de atualização de status
const StatusUpdateComponent = {
  template: `
    <div class="status-update-container">
      <div class="card">
        <h2 class="card-title">Atualizar Status</h2>
        <div class="process-info">
          <p><strong>SD:</strong> {{ process.sd_number }}</p>
          <p><strong>Objeto:</strong> {{ process.simplified_object }}</p>
          <p><strong>Status Atual:</strong> {{ process.status_name }}</p>
        </div>
        <form @submit.prevent="updateStatus">
          <div class="form-group">
            <label for="new-status">Novo Status</label>
            <select id="new-status" v-model="newStatus" required>
              <option value="">Selecione</option>
              <option v-for="status in statusList" :value="status.name">{{ status.name }}</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Atualizar</button>
            <button type="button" class="btn btn-secondary" @click="cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  props: {
    process: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      statusList: [],
      newStatus: ''
    }
  },
  mounted() {
    this.loadStatusList();
  },
  methods: {
    loadStatusList() {
      fetch('/api/lists/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.statusList = data;
      })
      .catch(error => {
        console.error('Erro ao carregar status:', error);
      });
    },
    updateStatus() {
      fetch(`/api/processes/${this.process.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: this.newStatus
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.message || 'Erro ao atualizar status');
        } else {
          alert(data.message || 'Status atualizado com sucesso');
          this.$emit('status-updated');
        }
      })
      .catch(error => {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status');
      });
    },
    cancel() {
      this.$emit('cancel');
    }
  }
};

// Componente de visualização de processo
const ProcessViewComponent = {
  template: `
    <div class="process-view-container">
      <div class="card">
        <h2 class="card-title">Detalhes do Processo</h2>
        <div class="process-details">
          <div class="detail-item">
            <span class="detail-label">SD:</span>
            <span class="detail-value">{{ process.sd_number }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Data de Abertura:</span>
            <span class="detail-value">{{ formatDate(process.opening_date) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Objeto Simplificado:</span>
            <span class="detail-value">{{ process.simplified_object }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Modalidade:</span>
            <span class="detail-value">{{ process.modality }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Responsável:</span>
            <span class="detail-value">{{ process.responsible_name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value">{{ process.status_name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Secretarias Participantes:</span>
            <span class="detail-value">{{ process.participating_secretaries.join(', ') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Fiscais de Contrato:</span>
            <span class="detail-value">{{ process.contract_supervisors.join(', ') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Observações:</span>
            <span class="detail-value">{{ process.observations }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="editProcess">Editar</button>
          <button class="btn btn-warning" @click="updateStatus">Atualizar Status</button>
          <button class="btn btn-secondary" @click="back">Voltar</button>
        </div>
      </div>
    </div>
  `,
  props: {
    processId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      process: {
        sd_number: '',
        opening_date: '',
        simplified_object: '',
        modality: '',
        responsible_name: '',
        status_name: '',
        participating_secretaries: [],
        contract_supervisors: [],
        observations: ''
      }
    }
  },
  mounted() {
    this.loadProcess();
  },
  methods: {
    loadProcess() {
      fetch(`/api/processes/${this.processId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.process = data;
      })
      .catch(error => {
        console.error('Erro ao carregar processo:', error);
      });
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    },
    editProcess() {
      this.$emit('edit-process', this.processId);
    },
    updateStatus() {
      this.$emit('update-status', this.process);
    },
    back() {
      this.$emit('back');
    }
  }
};

// Componente de relatórios
const ReportComponent = {
  template: `
    <div class="report-container">
      <h2>Relatórios</h2>
      
      <div class="report-tabs">
        <button class="tab-button" :class="{ active: activeTab === 'status' }" @click="activeTab = 'status'">
          Por Status
        </button>
        <button class="tab-button" :class="{ active: activeTab === 'summary' }" @click="activeTab = 'summary'">
          Resumo Geral
        </button>
      </div>
      
      <div class="report-content">
        <!-- Relatório por Status -->
        <div v-if="activeTab === 'status'" class="status-report">
          <h3>Processos por Status</h3>
          <div class="chart-container">
            <canvas ref="statusChart"></canvas>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in statusReport" :key="item.status">
                  <td>{{ item.status }}</td>
                  <td>{{ item.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Resumo Geral -->
        <div v-if="activeTab === 'summary'" class="summary-report">
          <h3>Resumo Geral</h3>
          <div class="summary-card">
            <h4>Total de Processos</h4>
            <div class="summary-value">{{ summary.total }}</div>
          </div>
          
          <h4>Por Responsável</h4>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in summary.byResponsible" :key="item.responsible">
                  <td>{{ item.responsible }}</td>
                  <td>{{ item.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h4>Por Modalidade</h4>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Modalidade</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in summary.byModality" :key="item.modality">
                  <td>{{ item.modality }}</td>
                  <td>{{ item.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h4>Por Secretaria</h4>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Secretaria</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in summary.bySecretary" :key="item.secretary">
                  <td>{{ item.secretary }}</td>
                  <td>{{ item.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      activeTab: 'status',
      statusReport: [],
      summary: {
        total: 0,
        byResponsible: [],
        byModality: [],
        byMonth: [],
        bySecretary: []
      },
      statusChart: null
    }
  },
  mounted() {
    this.loadReports();
  },
  methods: {
    loadReports() {
      // Carregar relatório por status
      fetch('/api/reports/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.statusReport = data;
        this.$nextTick(() => {
          this.renderStatusChart();
        });
      })
      .catch(error => {
        console.error('Erro ao carregar relatório de status:', error);
      });
      
      // Carregar resumo geral
      fetch('/api/reports/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        this.summary = data;
      })
      .catch(error => {
        console.error('Erro ao carregar resumo geral:', error);
      });
    },
    renderStatusChart() {
      const ctx = this.$refs.statusChart.getContext('2d');
      
      // Destruir gráfico existente, se houver
      if (this.statusChart) {
        this.statusChart.destroy();
      }
      
      const labels = this.statusReport.map(item => item.status);
      const data = this.statusReport.map(item => item.total);
      
      this.statusChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Processos por Status',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'status') {
        this.$nextTick(() => {
          this.renderStatusChart();
        });
      }
    }
  }
};

// Componente principal do aplicativo
const App = {
  template: `
    <div id="app">
      <header>
        <div class="container">
          <h1>Sistema de Controle de Processos</h1>
          <div v-if="isAuthenticated" class="user-info">
            <span>{{ user.name }}</span>
            <button class="btn btn-sm btn-outline" @click="logout">Sair</button>
          </div>
        </div>
      </header>
      
      <main class="container">
        <!-- Componente de autenticação -->
        <auth-component v-if="!isAuthenticated" @login-success="handleLoginSuccess"></auth-component>
        
        <!-- Conteúdo principal após autenticação -->
        <div v-else class="main-content">
          <nav class="main-nav">
            <ul>
              <li>
                <a href="#" @click.prevent="currentView = 'processes'" :class="{ active: currentView === 'processes' }">
                  Processos
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="currentView = 'reports'" :class="{ active: currentView === 'reports' }">
                  Relatórios
                </a>
              </li>
            </ul>
          </nav>
          
          <div class="content-area">
            <!-- Lista de processos -->
            <process-list-component 
              v-if="currentView === 'processes' && !showProcessForm && !showProcessView && !showStatusUpdate"
              @show-process-form="handleShowProcessForm"
              @view-process="handleViewProcess"
              @edit-process="handleEditProcess"
              @update-status="handleShowStatusUpdate">
            </process-list-component>
            
            <!-- Formulário de processo -->
            <process-form-component 
              v-if="showProcessForm"
              :process-id="selectedProcessId"
              :is-new="isNewProcess"
              @process-saved="handleProcessSaved"
              @cancel="handleFormCancel">
            </process-form-component>
            
            <!-- Visualização de processo -->
            <process-view-component 
              v-if="showProcessView"
              :process-id="selectedProcessId"
              @edit-process="handleEditProcess"
              @update-status="handleShowStatusUpdate"
              @back="handleViewBack">
            </process-view-component>
            
            <!-- Atualização de status -->
            <status-update-component 
              v-if="showStatusUpdate"
              :process="selectedProcess"
              @status-updated="handleStatusUpdated"
              @cancel="handleStatusCancel">
            </status-update-component>
            
            <!-- Relatórios -->
            <report-component v-if="currentView === 'reports'"></report-component>
          </div>
        </div>
      </main>
      
      <footer>
        <div class="container">
          <p>&copy; 2025 Sistema de Controle de Processos</p>
        </div>
      </footer>
    </div>
  `,
  components: {
    'auth-component': AuthComponent,
    'process-list-component': ProcessListComponent,
    'process-form-component': ProcessFormComponent,
    'process-view-component': ProcessViewComponent,
    'status-update-component': StatusUpdateComponent,
    'report-component': ReportComponent
  },
  data() {
    return {
      isAuthenticated: false,
      user: null,
      currentView: 'processes',
      showProcessForm: false,
      showProcessView: false,
      showStatusUpdate: false,
      selectedProcessId: null,
      selectedProcess: null,
      isNewProcess: true
    }
  },
  mounted() {
    // Verificar se o usuário já está autenticado
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.isAuthenticated = true;
      this.user = JSON.parse(user);
    }
  },
  methods: {
    handleLoginSuccess() {
      this.isAuthenticated = true;
      this.user = JSON.parse(localStorage.getItem('user'));
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isAuthenticated = false;
      this.user = null;
    },
    handleShowProcessForm(data) {
      this.showProcessForm = true;
      this.showProcessView = false;
      this.showStatusUpdate = false;
      this.isNewProcess = data.isNew;
      this.selectedProcessId = data.isNew ? null : data.id;
    },
    handleViewProcess(id) {
      this.selectedProcessId = id;
      this.showProcessView = true;
      this.showProcessForm = false;
      this.showStatusUpdate = false;
    },
    handleEditProcess(id) {
      this.selectedProcessId = id;
      this.isNewProcess = false;
      this.showProcessForm = true;
      this.showProcessView = false;
      this.showStatusUpdate = false;
    },
    handleShowStatusUpdate(process) {
      this.selectedProcess = process;
      this.showStatusUpdate = true;
      this.showProcessForm = false;
      this.showProcessView = false;
    },
    handleProcessSaved() {
      this.showProcessForm = false;
      this.currentView = 'processes';
    },
    handleFormCancel() {
      this.showProcessForm = false;
    },
    handleViewBack() {
      this.showProcessView = false;
    },
    handleStatusUpdated() {
      this.showStatusUpdate = false;
      this.currentView = 'processes';
    },
    handleStatusCancel() {
      this.showStatusUpdate = false;
    }
  }
};

// Inicializar o aplicativo
document.addEventListener('DOMContentLoaded', () => {
  createApp(App).mount('#app');
});
