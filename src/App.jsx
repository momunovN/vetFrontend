import React, { useState, useEffect } from 'react'

const API_URL = 'https://vetbackend-mby3.onrender.com/api'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Восстанавливаем пользователя из localStorage при загрузке
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('login')
  const [pets, setPets] = useState([])
  const [appointments, setAppointments] = useState([])
  const [userPets, setUserPets] = useState([])
  const [users, setUsers] = useState([])
  const [vetAppointments, setVetAppointments] = useState([])

  // Формы
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'client' })
  const [petForm, setPetForm] = useState({ name: '', type: '', breed: '', age: '' })
  const [appointmentForm, setAppointmentForm] = useState({ petId: '', date: '', time: '', reason: '' })
  const [appointmentDetails, setAppointmentDetails] = useState({ diagnosis: '', treatment: '' })

  // Вспомогательные функции для работы с данными
  const getUserId = (user) => {
    return user?._id || user?.id || user;
  }

  const getUserName = (user) => {
    if (!user) return 'Неизвестно';
    if (typeof user === 'string') return user;
    return user.name || 'Неизвестно';
  }

  const getUserEmail = (user) => {
    if (!user) return '';
    if (typeof user === 'string') return '';
    return user.email || '';
  }

  const getPetName = (pet) => {
    if (!pet) return 'Неизвестно';
    if (typeof pet === 'string') return pet;
    return pet.name || 'Неизвестно';
  }

  const getPetType = (pet) => {
    if (!pet) return '';
    if (typeof pet === 'string') return '';
    return pet.type || '';
  }

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setActiveTab('dashboard');
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadPets()
      loadAppointments()
      loadUserPets()
      
      if (currentUser.role === 'admin') {
        loadUsers()
      }
      if (currentUser.role === 'vet') {
        loadVetAppointments()
      }
    }
  }, [currentUser])

  const loadPets = async () => {
    try {
      const response = await fetch(`${API_URL}/pets`)
      const data = await response.json()
      setPets(data)
    } catch (error) {
      console.error('Error loading pets:', error)
    }
  }

  const loadUserPets = async () => {
    try {
      const response = await fetch(`${API_URL}/pets/user/${currentUser.id}`)
      const data = await response.json()
      setUserPets(data)
    } catch (error) {
      console.error('Error loading user pets:', error)
    }
  }

  const loadAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments`)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadVetAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments/vet/${currentUser.id}`)
      const data = await response.json()
      setVetAppointments(data)
    } catch (error) {
      console.error('Error loading vet appointments:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.user)
        setLoginForm({ email: '', password: '' })
      } else {
        alert(data.message || 'Ошибка входа')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Ошибка подключения к серверу')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      })
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.user)
        setRegisterForm({ name: '', email: '', password: '', role: 'client' })
      } else {
        alert(data.message || 'Ошибка регистрации')
      }
    } catch (error) {
      console.error('Register error:', error)
      alert('Ошибка подключения к серверу')
    }
  }

  const handleAddPet = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...petForm,
          ownerId: currentUser.id
        })
      })
      const data = await response.json()
      if (data.success) {
        setPets([...pets, data.pet])
        setUserPets([...userPets, data.pet])
        setPetForm({ name: '', type: '', breed: '', age: '' })
        setActiveTab('my-pets')
      } else {
        alert('Ошибка добавления питомца')
      }
    } catch (error) {
      console.error('Error adding pet:', error)
      alert('Ошибка добавления питомца')
    }
  }

  const handleAddAppointment = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appointmentForm,
          ownerId: currentUser.id
        })
      })
      const data = await response.json()
      if (data.success) {
        setAppointments([...appointments, data.appointment])
        setAppointmentForm({ petId: '', date: '', time: '', reason: '' })
        setActiveTab('my-appointments')
        alert('Запись успешно создана! Ожидайте подтверждения администратором.')
      } else {
        alert('Ошибка создания записи')
      }
    } catch (error) {
      console.error('Error adding appointment:', error)
      alert('Ошибка создания записи')
    }
  }

  const changeUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      const data = await response.json()
      if (data.success) {
        alert('Роль успешно изменена')
        loadUsers()
      }
    } catch (error) {
      console.error('Error changing role:', error)
      alert('Ошибка изменения роли')
    }
  }

  const confirmAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (data.success) {
        alert('Запись подтверждена')
        loadAppointments()
      }
    } catch (error) {
      console.error('Error confirming appointment:', error)
      alert('Ошибка подтверждения записи')
    }
  }

  const updateAppointmentStatus = async (appointmentId, status, diagnosis = '', treatment = '') => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, diagnosis, treatment })
      })
      const data = await response.json()
      if (data.success) {
        alert('Статус обновлен')
        loadAppointments()
        loadVetAppointments()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Ошибка обновления статуса')
    }
  }

  const assignVetToAppointment = async (appointmentId, vetId) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/assign-vet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vetId })
      })
      const data = await response.json()
      if (data.success) {
        alert('Врач назначен')
        loadAppointments()
        loadVetAppointments()
      }
    } catch (error) {
      console.error('Error assigning vet:', error)
      alert('Ошибка назначения врача')
    }
  }

  const completeAppointmentWithDetails = async (appointmentId) => {
    if (!appointmentDetails.diagnosis || !appointmentDetails.treatment) {
      alert('Пожалуйста, заполните диагноз и лечение')
      return
    }
    await updateAppointmentStatus(
      appointmentId, 
      'completed', 
      appointmentDetails.diagnosis, 
      appointmentDetails.treatment
    )
    setAppointmentDetails({ diagnosis: '', treatment: '' })
  }

  const logout = () => {
    setCurrentUser(null)
    setActiveTab('login')
    setPets([])
    setAppointments([])
    setUserPets([])
    setUsers([])
    setVetAppointments([])
    localStorage.removeItem('currentUser');
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'
      case 'confirmed': return '#28A745'
      case 'in_progress': return '#17a2b8'
      case 'completed': return '#6c757d'
      case 'cancelled': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения'
      case 'confirmed': return 'Подтверждена'
      case 'in_progress': return 'В процессе'
      case 'completed': return 'Завершена'
      case 'cancelled': return 'Отменена'
      default: return status
    }
  }

  // Автоматически переходим на dashboard если пользователь уже вошел
  useEffect(() => {
    if (currentUser && activeTab === 'login') {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  if (!currentUser) {
    return (
      <div className="container">
        <div className="header">
          <div className="nav">
            <div className="logo">🐾 Ветеринарная клиника</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className={`btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
            style={{ background: activeTab === 'login' ? '#4F7CAC' : '#6BBF70' }}
          >
            Вход
          </button>
          <button 
            className={`btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
            style={{ background: activeTab === 'register' ? '#4F7CAC' : '#6BBF70' }}
          >
            Регистрация
          </button>
        </div>

        {activeTab === 'login' && (
          <div className="card">
            <h2>Вход в систему</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Тестовые аккаунты:<br />
              • Админ: admin@vet.ru / 123<br />
              • Врач: vet@vet.ru / 123<br />
              • Клиент: client@vet.ru / 123
            </p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required 
                  placeholder="Введите email"
                />
              </div>
              <div className="form-group">
                <label>Пароль:</label>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required 
                  placeholder="Введите пароль"
                />
              </div>
              <button type="submit" className="btn">Войти</button>
            </form>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="card">
            <h2>Регистрация</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Имя:</label>
                <input 
                  type="text" 
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  required 
                  placeholder="Введите ваше имя"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  required 
                  placeholder="Введите email"
                />
              </div>
              <div className="form-group">
                <label>Пароль:</label>
                <input 
                  type="password" 
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  required 
                  placeholder="Введите пароль"
                />
              </div>
              <div className="form-group">
                <label>Роль:</label>
                <select 
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                >
                  <option value="client">Клиент</option>
                  <option value="vet">Ветеринар</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <button type="submit" className="btn">Зарегистрироваться</button>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <div className="nav">
          <div className="logo">🐾 Ветеринарная клиника</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Привет, {currentUser.name} ({currentUser.role})</span>
            <button className="btn" onClick={logout} style={{ background: '#dc3545' }}>Выйти</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['dashboard', 'my-pets', 'all-pets', 'my-appointments', 'all-appointments', 'add-pet', 'add-appointment'].map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: activeTab === tab ? '#4F7CAC' : '#6BBF70',
              fontSize: '12px',
              padding: '8px 12px'
            }}
          >
            {{
              dashboard: '📊 Главная',
              'my-pets': '🐶 Мои питомцы',
              'all-pets': '📋 Все питомцы',
              'my-appointments': '📅 Мои записи',
              'all-appointments': '🗓️ Все записи',
              'add-pet': '➕ Добавить питомца',
              'add-appointment': '🕒 Новая запись'
            }[tab]}
          </button>
        ))}

        {currentUser.role === 'admin' && [
          'admin-users',
          'admin-appointments'
        ].map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: activeTab === tab ? '#4F7CAC' : '#6BBF70',
              fontSize: '12px',
              padding: '8px 12px'
            }}
          >
            {{
              'admin-users': '👥 Управление пользователями',
              'admin-appointments': '📋 Все записи (админ)'
            }[tab]}
          </button>
        ))}

        {currentUser.role === 'vet' && [
          'vet-appointments',
          'vet-schedule'
        ].map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: activeTab === tab ? '#4F7CAC' : '#6BBF70',
              fontSize: '12px',
              padding: '8px 12px'
            }}
          >
            {{
              'vet-appointments': '🏥 Мои приемы',
              'vet-schedule': '📅 Расписание'
            }[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <h2>Панель управления</h2>
          <div className="grid">
            <div className="card">
              <h3>📈 Статистика</h3>
              <p>Всего питомцев: {pets.length}</p>
              <p>Мои питомцы: {userPets.length}</p>
              <p>Всего записей: {appointments.length}</p>
              <p>Мои записи: {appointments.filter(apt => getUserId(apt.ownerId) === currentUser.id).length}</p>
              {currentUser.role === 'vet' && (
                <p>Мои приемы: {vetAppointments.length}</p>
              )}
            </div>
            <div className="card">
              <h3>📅 Ближайшие записи</h3>
              {appointments
                .filter(apt => apt.status === 'confirmed' || apt.status === 'in_progress')
                .slice(0, 5)
                .map(apt => (
                  <div key={apt._id} className="appointment-card">
                    <strong>{formatDate(apt.date)} {apt.time}</strong>
                    <p>Питомец: {getPetName(apt.petId)}</p>
                    <p>Причина: {apt.reason}</p>
                    <p>Статус: 
                      <span style={{
                        color: getStatusColor(apt.status),
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {getStatusText(apt.status)}
                      </span>
                    </p>
                  </div>
                ))}
            </div>
            <div className="card">
              <h3>👤 Информация</h3>
              <p><strong>Имя:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Роль:</strong> {currentUser.role}</p>
              <p><strong>ID:</strong> {currentUser.id}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'my-pets' && (
        <div>
          <h2>Мои питомцы</h2>
          {userPets.length === 0 ? (
            <div className="card">
              <p>У вас пока нет питомцев. <a onClick={() => setActiveTab('add-pet')} style={{color: '#4F7CAC', cursor: 'pointer'}}>Добавьте первого питомца</a></p>
            </div>
          ) : (
            <div className="grid">
              {userPets.map(pet => (
                <div key={pet._id} className="pet-card">
                  <h3>{pet.name}</h3>
                  <p><strong>Вид:</strong> {pet.type}</p>
                  <p><strong>Порода:</strong> {pet.breed || 'Не указана'}</p>
                  <p><strong>Возраст:</strong> {pet.age || 'Не указан'}</p>
                  <p><strong>Добавлен:</strong> {formatDate(pet.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all-pets' && (
        <div>
          <h2>Все питомцы в клинике</h2>
          <div className="grid">
            {pets.map(pet => (
              <div key={pet._id} className="pet-card">
                <h3>{pet.name}</h3>
                <p><strong>Вид:</strong> {pet.type}</p>
                <p><strong>Порода:</strong> {pet.breed || 'Не указана'}</p>
                <p><strong>Возраст:</strong> {pet.age || 'Не указан'}</p>
                <p><strong>Владелец:</strong> {getUserName(pet.ownerId)}</p>
                <p><strong>Добавлен:</strong> {formatDate(pet.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my-appointments' && (
        <div>
          <h2>Мои записи на прием</h2>
          {appointments.filter(apt => getUserId(apt.ownerId) === currentUser.id).length === 0 ? (
            <div className="card">
              <p>У вас пока нет записей. <a onClick={() => setActiveTab('add-appointment')} style={{color: '#4F7CAC', cursor: 'pointer'}}>Создайте первую запись</a></p>
            </div>
          ) : (
            appointments
              .filter(apt => getUserId(apt.ownerId) === currentUser.id)
              .map(apt => (
                <div key={apt._id} className="appointment-card">
                  <h4>Запись от {formatDate(apt.date)} {apt.time}</h4>
                  <p><strong>Питомец:</strong> {getPetName(apt.petId)}</p>
                  <p><strong>Причина:</strong> {apt.reason}</p>
                  <p><strong>Статус:</strong> 
                    <span style={{
                      color: getStatusColor(apt.status),
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {getStatusText(apt.status)}
                    </span>
                  </p>
                  <p><strong>Врач:</strong> {getUserName(apt.vetId)}</p>
                  <p><strong>Создана:</strong> {formatDate(apt.createdAt)}</p>
                  {apt.diagnosis && <p><strong>Диагноз:</strong> {apt.diagnosis}</p>}
                  {apt.treatment && <p><strong>Лечение:</strong> {apt.treatment}</p>}
                </div>
              ))
          )}
        </div>
      )}

      {activeTab === 'all-appointments' && (
        <div>
          <h2>Все записи в клинике</h2>
          {appointments.map(apt => (
            <div key={apt._id} className="appointment-card">
              <h4>Запись от {formatDate(apt.date)} {apt.time}</h4>
              <p><strong>Питомец:</strong> {getPetName(apt.petId)} ({getPetType(apt.petId)})</p>
              <p><strong>Владелец:</strong> {getUserName(apt.ownerId)}</p>
              <p><strong>Врач:</strong> {getUserName(apt.vetId)}</p>
              <p><strong>Причина:</strong> {apt.reason}</p>
              <p><strong>Статус:</strong> 
                <span style={{
                  color: getStatusColor(apt.status),
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {getStatusText(apt.status)}
                </span>
              </p>
              <p><strong>Создана:</strong> {formatDate(apt.createdAt)}</p>
              {apt.diagnosis && <p><strong>Диагноз:</strong> {apt.diagnosis}</p>}
              {apt.treatment && <p><strong>Лечение:</strong> {apt.treatment}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'add-pet' && (
        <div className="card">
          <h2>Добавить питомца</h2>
          <form onSubmit={handleAddPet}>
            <div className="form-group">
              <label>Кличка:</label>
              <input 
                type="text" 
                value={petForm.name}
                onChange={(e) => setPetForm({...petForm, name: e.target.value})}
                required 
                placeholder="Введите кличку питомца"
              />
            </div>
            <div className="form-group">
              <label>Вид:</label>
              <input 
                type="text" 
                value={petForm.type}
                onChange={(e) => setPetForm({...petForm, type: e.target.value})}
                required 
                placeholder="Например: Собака, Кошка"
              />
            </div>
            <div className="form-group">
              <label>Порода:</label>
              <input 
                type="text" 
                value={petForm.breed}
                onChange={(e) => setPetForm({...petForm, breed: e.target.value})}
                placeholder="Например: Лабрадор, Сиамская"
              />
            </div>
            <div className="form-group">
              <label>Возраст:</label>
              <input 
                type="text" 
                value={petForm.age}
                onChange={(e) => setPetForm({...petForm, age: e.target.value})}
                placeholder="Например: 2 года, 5 месяцев"
              />
            </div>
            <button type="submit" className="btn">Добавить питомца</button>
          </form>
        </div>
      )}

      {activeTab === 'add-appointment' && (
        <div className="card">
          <h2>Новая запись на прием</h2>
          {userPets.length === 0 ? (
            <div style={{background: '#fff3cd', padding: '15px', borderRadius: '5px', marginBottom: '20px'}}>
              <p>❌ У вас нет питомцев. Сначала <a onClick={() => setActiveTab('add-pet')} style={{color: '#4F7CAC', cursor: 'pointer'}}>добавьте питомца</a>.</p>
            </div>
          ) : (
            <form onSubmit={handleAddAppointment}>
              <div className="form-group">
                <label>Питомец:</label>
                <select 
                  value={appointmentForm.petId}
                  onChange={(e) => setAppointmentForm({...appointmentForm, petId: e.target.value})}
                  required
                >
                  <option value="">Выберите питомца</option>
                  {userPets.map(pet => (
                    <option key={pet._id} value={pet._id}>{pet.name} ({pet.type})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Дата:</label>
                <input 
                  type="date" 
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Время:</label>
                <input 
                  type="time" 
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Причина визита:</label>
                <textarea 
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
                  required 
                  placeholder="Опишите причину визита"
                  rows="3"
                />
              </div>
              <button type="submit" className="btn">Создать запись</button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'admin-users' && (
        <div>
          <h2>👥 Управление пользователями</h2>
          <div className="grid">
            {users.map(user => (
              <div key={user._id} className="card">
                <h3>{user.name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Текущая роль:</strong> 
                  <span style={{
                    color: user.role === 'admin' ? '#dc3545' : 
                           user.role === 'vet' ? '#17a2b8' : '#28A745',
                    fontWeight: 'bold',
                    marginLeft: '5px'
                  }}>
                    {user.role}
                  </span>
                </p>
                <div className="form-group">
                  <label>Изменить роль:</label>
                  <select 
                    value={user.role}
                    onChange={(e) => changeUserRole(user._id, e.target.value)}
                  >
                    <option value="client">Клиент</option>
                    <option value="vet">Ветеринар</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'admin-appointments' && (
        <div>
          <h2>📋 Все записи в системе</h2>
          {appointments.map(apt => (
            <div key={apt._id} className="appointment-card">
              <h4>Запись от {formatDate(apt.date)} {apt.time}</h4>
              <p><strong>Питомец:</strong> {getPetName(apt.petId)} ({getPetType(apt.petId)})</p>
              <p><strong>Владелец:</strong> {getUserName(apt.ownerId)}</p>
              <p><strong>Врач:</strong> {getUserName(apt.vetId)}</p>
              <p><strong>Причина:</strong> {apt.reason}</p>
              <p><strong>Статус:</strong> 
                <span style={{
                  color: getStatusColor(apt.status),
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {getStatusText(apt.status)}
                </span>
              </p>
              
              {apt.status === 'pending' && (
                <button 
                  className="btn" 
                  onClick={() => confirmAppointment(apt._id)}
                  style={{ background: '#28A745', marginTop: '10px', marginRight: '10px' }}
                >
                  Подтвердить запись
                </button>
              )}
              
              {apt.diagnosis && <p><strong>Диагноз:</strong> {apt.diagnosis}</p>}
              {apt.treatment && <p><strong>Лечение:</strong> {apt.treatment}</p>}
              <p><strong>Создана:</strong> {formatDate(apt.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vet-appointments' && (
        <div>
          <h2>🏥 Мои приемы</h2>
          {vetAppointments.map(apt => (
            <div key={apt._id} className="appointment-card">
              <h4>Прием от {formatDate(apt.date)} {apt.time}</h4>
              <p><strong>Питомец:</strong> {getPetName(apt.petId)} ({getPetType(apt.petId)})</p>
              <p><strong>Владелец:</strong> {getUserName(apt.ownerId)}</p>
              <p><strong>Причина:</strong> {apt.reason}</p>
              <p><strong>Статус:</strong> 
                <span style={{
                  color: getStatusColor(apt.status),
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {getStatusText(apt.status)}
                </span>
              </p>

              <div style={{ marginTop: '15px' }}>
                <strong>Управление приемом:</strong>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {apt.status === 'confirmed' && (
                    <button 
                      className="btn" 
                      onClick={() => updateAppointmentStatus(apt._id, 'in_progress')}
                      style={{ background: '#17a2b8' }}
                    >
                      Начать прием
                    </button>
                  )}
                  {apt.status === 'in_progress' && (
                    <>
                      <div style={{ width: '100%', marginBottom: '10px' }}>
                        <div className="form-group">
                          <label>Диагноз:</label>
                          <textarea 
                            value={appointmentDetails.diagnosis}
                            onChange={(e) => setAppointmentDetails({...appointmentDetails, diagnosis: e.target.value})}
                            placeholder="Введите диагноз"
                            rows="2"
                          />
                        </div>
                        <div className="form-group">
                          <label>Лечение:</label>
                          <textarea 
                            value={appointmentDetails.treatment}
                            onChange={(e) => setAppointmentDetails({...appointmentDetails, treatment: e.target.value})}
                            placeholder="Введите назначенное лечение"
                            rows="2"
                          />
                        </div>
                      </div>
                      <button 
                        className="btn" 
                        onClick={() => completeAppointmentWithDetails(apt._id)}
                        style={{ background: '#28A745' }}
                      >
                        Завершить прием
                      </button>
                      <button 
                        className="btn" 
                        onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                        style={{ background: '#dc3545' }}
                      >
                        Отменить прием
                      </button>
                    </>
                  )}
                </div>
              </div>

              {apt.diagnosis && <p><strong>Диагноз:</strong> {apt.diagnosis}</p>}
              {apt.treatment && <p><strong>Лечение:</strong> {apt.treatment}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vet-schedule' && (
        <div>
          <h2>📅 Расписание приемов</h2>
          {appointments
            .filter(apt => apt.status === 'confirmed' || apt.status === 'in_progress')
            .map(apt => (
              <div key={apt._id} className="appointment-card">
                <h4>{formatDate(apt.date)} {apt.time}</h4>
                <p><strong>Питомец:</strong> {getPetName(apt.petId)} ({getPetType(apt.petId)})</p>
                <p><strong>Владелец:</strong> {getUserName(apt.ownerId)}</p>
                <p><strong>Причина:</strong> {apt.reason}</p>
                <p><strong>Статус:</strong> 
                  <span style={{
                    color: getStatusColor(apt.status),
                    fontWeight: 'bold',
                    marginLeft: '5px'
                  }}>
                    {getStatusText(apt.status)}
                  </span>
                </p>
                
                {!apt.vetId && (
                  <button 
                    className="btn" 
                    onClick={() => assignVetToAppointment(apt._id, currentUser.id)}
                    style={{ background: '#6BBF70', marginTop: '10px' }}
                  >
                    Взять на себя
                  </button>
                )}
                {apt.vetId && getUserId(apt.vetId) !== currentUser.id && (
                  <p style={{ color: '#6c757d', marginTop: '10px' }}>
                    Назначен врач: {getUserName(apt.vetId)}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default App