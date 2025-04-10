'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Copy, Trash, Plus, ArrowRight, ArrowDown, Eye, EyeSlash, Warning } from '@phosphor-icons/react'

// Add type for API key
interface ApiKey {
  id: string
  key: string
  name: string
  created: number
  lastUsed?: number
  isNew?: boolean // Флаг для новых ключей
  isVisible?: boolean // Флаг видимости ключа
  copyCount?: number // Счетчик копирований
  isCopied?: boolean // Флаг копирования ключа
}

const MAX_API_KEYS = 3; // Максимальное количество ключей
const MAX_COPY_COUNT = 3; // Максимальное количество копирований ключа

const DevPage = () => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)
  const [deleteAnimation, setDeleteAnimation] = useState<string | null>(null)
  const [showKeyLimitWarning, setShowKeyLimitWarning] = useState(false)
  const [copyCodeSuccess, setCopyCodeSuccess] = useState<string | null>(null)
  const [copyLimitReached, setCopyLimitReached] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Ref для плавного скролла к новому ключу
  const newKeyRef = useRef<HTMLDivElement>(null)

  // Check authentication
  useEffect(() => {
    try {
      // For demo purposes, always consider user authenticated
      // In a real app, we'd perform proper authentication
      setIsAuthenticated(true)
      
      // Try to load saved API keys if they exist
      const savedKeys = localStorage.getItem('samga-api-keys')
      if (savedKeys) {
        try {
          const parsed = JSON.parse(savedKeys)
          if (Array.isArray(parsed)) {
            // После копирования ключи будут всегда скрыты
            const processedKeys = parsed.map(key => ({
              ...key,
              isVisible: false
            }))
            setApiKeys(processedKeys)
          }
        } catch (e) {
          console.error('Error parsing saved API keys', e)
          // If there's an error, just start with an empty array
          localStorage.setItem('samga-api-keys', JSON.stringify([]))
        }
      }
    } catch (e) {
      console.error('Error in authentication check', e)
      // Even if there's an error, don't redirect the user
      setIsAuthenticated(true)
    }
  }, [])  // Remove router dependency to prevent unwanted redirects

  // Прокрутка к новому ключу
  useEffect(() => {
    if (newKeyRef.current) {
      newKeyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [apiKeys])
  
  // Generate a new API key
  const generateApiKey = () => {
    if (!newKeyName.trim()) return
    
    // Проверка на максимальное количество ключей
    if (apiKeys.length >= MAX_API_KEYS) {
      setShowKeyLimitWarning(true)
      setTimeout(() => setShowKeyLimitWarning(false), 3000)
      return
    }
    
    const newKey = {
      id: uuidv4(),
      key: `samga_${uuidv4().replace(/-/g, '')}`,
      name: newKeyName,
      created: Date.now(),
      isNew: true,    // Помечаем как новый
      isVisible: true // Делаем видимым при создании
    }
    
    const updatedKeys = [...apiKeys, newKey]
    setApiKeys(updatedKeys)
    localStorage.setItem('samga-api-keys', JSON.stringify(updatedKeys))
    setNewKeyName('')
  }
  
  // Delete an API key
  const deleteApiKey = (id: string) => {
    // Устанавливаем анимацию удаления
    setDeleteAnimation(id)
    
    // Ждем завершения анимации перед фактическим удалением
    setTimeout(() => {
      const updatedKeys = apiKeys.filter(key => key.id !== id)
      setApiKeys(updatedKeys)
      localStorage.setItem('samga-api-keys', JSON.stringify(updatedKeys))
      setDeleteAnimation(null)
    }, 500) // Время анимации
  }
  
  // Copy API key to clipboard with limit
  const copyToClipboard = (text: string, id: string) => {
    // Проверяем не был ли ключ уже скопирован
    const keyToCopy = apiKeys.find(key => key.id === id);
    if (keyToCopy?.isCopied) {
      setCopyLimitReached(id);
      setTimeout(() => setCopyLimitReached(null), 2000);
      return;
    }
    
    navigator.clipboard.writeText(text)
    setCopySuccess(id)
    
    // Отмечаем, что ключ был скопирован и скрываем его
    setApiKeys(prevKeys => 
      prevKeys.map(key => 
        key.id === id 
          ? { 
              ...key, 
              isCopied: true,
              isVisible: false,
              copyCount: 1
            } 
          : key
      )
    );
    
    // Сохраняем обновленный статус в localStorage
    setTimeout(() => {
      localStorage.setItem('samga-api-keys', JSON.stringify(apiKeys));
      setCopySuccess(null);
    }, 1500);
  }
  
  // Copy code example to clipboard
  const copyCodeToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyCodeSuccess(id);
    setTimeout(() => setCopyCodeSuccess(null), 1500);
  }
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU')
  }

  // Toggle endpoint details
  const toggleEndpoint = (endpoint: string) => {
    if (expandedEndpoint === endpoint) {
      setExpandedEndpoint(null)
    } else {
      setExpandedEndpoint(endpoint)
    }
  }

  // Переключить видимость ключа
  // Функция разрешает только временно показать ключ, если он не был скопирован
  const toggleKeyVisibility = (id: string) => {
    const targetKey = apiKeys.find(key => key.id === id);
    if (targetKey?.isCopied) {
      return; // Не позволяем показать ключ, если он уже был скопирован
    }
    
    setApiKeys(prevKeys => 
      prevKeys.map(key => 
        key.id === id 
          ? { ...key, isVisible: !key.isVisible } 
          : key
      )
    )
  }

  // Fetch API data (for real implementations)
  const fetchApiData = async (endpoint: string, params?: Record<string, string>) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Проверяем наличие API ключа
      const apiKey = apiKeys && apiKeys.length > 0 ? apiKeys[0]?.key : null;
      if (!apiKey) {
        setApiError("Необходим API ключ для выполнения запроса");
        setIsLoading(false);
        return null;
      }
      
      // Используем тестовые учетные данные - в реальном коде пользователь заменит их на свои
      const testIIN = "123456789012";
      const testPassword = "password123";
      
      // Используем реальный API-запрос с реальными данными
      const url = new URL(`https://samga.top/v1/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          iin: testIIN,
          password: testPassword,
          ...params
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error("API error:", error);
      setApiError(error instanceof Error ? error.message : "Неизвестная ошибка API");
      setIsLoading(false);
      return null;
    }
  };

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Проверка авторизации...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 animate-fade-in">SAMGA Разработчикам</h1>
      <p className="text-muted-foreground mb-6 animate-fade-in animation-delay-100">
        Создавайте приложения и интеграции с SAMGA API — быстрой и удобной альтернативой NIS Mektep.
      </p>
      
      <Tabs defaultValue="keys" className="w-full animate-slide-up animation-delay-150">
        <TabsList className="mb-4">
          <TabsTrigger value="keys">Ключи API</TabsTrigger>
          <TabsTrigger value="docs">Документация</TabsTrigger>
          <TabsTrigger value="examples">Примеры кода</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys" className="animate-fade-in animation-delay-200">
          <Card>
            <CardHeader>
              <CardTitle>Управление ключами API</CardTitle>
              <CardDescription>
                Создавайте и управляйте ключами API для доступа к данным SAMGA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Название ключа"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <Button 
                    onClick={generateApiKey} 
                    className="flex gap-1 items-center" 
                    disabled={apiKeys.length >= MAX_API_KEYS}
                  >
                    <Plus size={16} />
                    Создать
                  </Button>
                </div>
                
                {showKeyLimitWarning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 flex items-center gap-2 text-yellow-700 animate-shake">
                    <Warning size={18} />
                    <p className="text-sm">Достигнут лимит ключей ({MAX_API_KEYS}). Удалите неиспользуемые ключи.</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">
                    Активные ключи: {apiKeys.length}/{MAX_API_KEYS}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-muted-foreground">Активный</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      У вас пока нет ключей API. Создайте первый!
                    </div>
                  ) : (
                    apiKeys.map((apiKey, index) => (
                      <div 
                        key={apiKey.id} 
                        ref={apiKey.isNew ? newKeyRef : null}
                        className={`border rounded-lg p-4 transition-all duration-500 
                          ${apiKey.isNew ? 'animate-pop-in border-primary/50 bg-primary/5' : 'animate-slide-up'} 
                          ${deleteAnimation === apiKey.id ? 'animate-delete overflow-hidden' : ''}
                        `} 
                        style={{
                          animationDelay: apiKey.isNew ? '0ms' : `${index * 50}ms`, 
                          height: deleteAnimation === apiKey.id ? '0' : 'auto',
                          opacity: deleteAnimation === apiKey.id ? 0 : 1,
                          marginBottom: deleteAnimation === apiKey.id ? 0 : undefined,
                          padding: deleteAnimation === apiKey.id ? 0 : undefined,
                          borderWidth: deleteAnimation === apiKey.id ? 0 : undefined
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {apiKey.name}
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </h3>
                            <p className="text-xs text-muted-foreground">Создан: {formatDate(apiKey.created)}</p>
                          </div>
                          <div className="flex gap-1">
                            {/* Кнопка отображения ключа доступна только если ключ не был скопирован */}
                            {!apiKey.isCopied && (
                              <Button 
                                onClick={() => toggleKeyVisibility(apiKey.id)} 
                                className="h-8 w-8 p-0"
                                title={apiKey.isVisible ? "Скрыть ключ" : "Показать ключ"}
                              >
                                {apiKey.isVisible ? 
                                  <EyeSlash size={16} className="text-muted-foreground" /> : 
                                  <Eye size={16} className="text-muted-foreground" />
                                }
                              </Button>
                            )}
                            <Button 
                              onClick={() => deleteApiKey(apiKey.id)} 
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              title="Удалить ключ"
                            >
                              <Trash size={16} className="text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2 overflow-hidden">
                          <code className={`bg-muted px-2 py-1 rounded text-xs flex-1 truncate transition-all duration-300 ${apiKey.isVisible ? '' : 'blur-sm select-none'}`}>
                            {apiKey.key}
                          </code>
                          <Button 
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)} 
                            className={`h-8 px-2 transition-colors ${copySuccess === apiKey.id ? 'bg-green-500 text-white' : ''} ${copyLimitReached === apiKey.id ? 'bg-red-500 text-white' : ''}`}
                            disabled={apiKey.isCopied}
                            title={apiKey.isCopied ? "Ключ уже скопирован" : "Копировать ключ"}
                          >
                            {copySuccess === apiKey.id ? 'Скопировано' : 
                             copyLimitReached === apiKey.id ? 'Недоступно' : 
                             apiKey.isCopied ? 'Скопирован' : <Copy size={14} />}
                          </Button>
                        </div>
                        
                        {apiKey.isNew && (
                          <div className="mt-3 text-xs p-2 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-800">
                            <p className="font-medium">Важно: сохраните этот ключ сейчас!</p>
                            <p className="mt-1">По соображениям безопасности, ключ можно скопировать только один раз, после чего он будет скрыт навсегда.</p>
                          </div>
                        )}
                        
                        {!apiKey.isNew && apiKey.isCopied && (
                          <div className="mt-2 text-xs text-amber-600">
                            Ключ был скопирован ранее и теперь недоступен для просмотра
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              {apiKeys.length > 0 && (
                <div className="rounded-md p-3 border bg-amber-50 border-amber-200">
                  <h4 className="text-sm font-medium mb-1 text-amber-800">Как использовать API ключ</h4>
                  <p className="text-xs text-amber-700 mb-2">Для использования API ключа добавьте в ваш код:</p>
                  <div className="bg-amber-100/50 p-2 rounded text-xs font-mono mb-2">
                    <p className="mb-1"><span className="text-purple-700">const</span> <span className="text-blue-700">API_KEY</span> = <span className="text-green-700">"{apiKeys.length > 0 && apiKeys[0]?.key ? apiKeys[0].key : 'ваш_ключ'}"</span>;</p>
                    <p className="mb-1"><span className="text-purple-700">const</span> <span className="text-blue-700">IIN</span> = <span className="text-green-700">"XXXXXXXXXX"</span>; <span className="text-slate-500">// ваш ИИН</span></p>
                    <p><span className="text-purple-700">const</span> <span className="text-blue-700">PASSWORD</span> = <span className="text-green-700">"your_password"</span>; <span className="text-slate-500">// ваш пароль</span></p>
                  </div>
                  <p className="text-xs text-amber-700">
                    Примеры использования API доступны во вкладке "Примеры кода".
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs" className="animate-fade-in animation-delay-150">
          <Card>
            <CardHeader>
              <CardTitle>Документация API</CardTitle>
              <CardDescription>
                Полная документация SAMGA API для разработки приложений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="animate-slide-up">
                  <h3 className="font-semibold text-lg">Аутентификация</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Все запросы к API должны содержать ваш ключ API в заголовке запроса.
                    </p>
                    <code className="block bg-muted p-2 rounded text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                    <p className="text-sm text-muted-foreground">
                      Ключи API можно создать и управлять ими во вкладке "Ключи API". 
                      Каждый запрос без действительного ключа API будет отклонен с ошибкой 401 Unauthorized.
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="animate-slide-up animation-delay-100">
                  <h3 className="font-semibold text-lg">Базовый URL</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Все запросы должны быть адресованы к базовому URL:
                  </p>
                  <code className="block bg-muted p-2 rounded text-sm mt-2">
                    https://samga.top/v1
                  </code>
                </div>
                
                <Separator />
                
                <div className="animate-slide-up animation-delay-200">
                  <h3 className="font-semibold text-lg">Эндпоинты API</h3>
                  <div className="space-y-5 mt-3">
                    {/* User Endpoint */}
                    <div className="border rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/80"
                        onClick={() => toggleEndpoint('user')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded font-medium">GET</span>
                          <code className="text-sm font-semibold">/api/v1/user</code>
                        </div>
                        <ArrowDown 
                          size={16} 
                          className={`text-muted-foreground transition-transform ${expandedEndpoint === 'user' ? 'rotate-180' : ''}`} 
                        />
                      </div>
                      
                      {expandedEndpoint === 'user' && (
                        <div className="p-3 border-t animate-slide-down">
                          <p className="text-sm mb-3">
                            Получение информации о текущем пользователе. Этот эндпоинт возвращает данные профиля пользователя, 
                            связанного с использованным API ключом.
                          </p>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Параметры запроса</h4>
                            <p className="text-sm">Нет</p>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ответ</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`{
  "id": "1234567890",
  "name": "Иван Иванов",
  "email": "student@example.com",
  "role": "student",
  "grade": "10",
  "class": "A",
  "school": "НИШ Астана",
  "created_at": "2023-01-01T00:00:00Z",
  "last_login": "2023-05-10T12:34:56Z"
}`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`{
  "id": "1234567890",
  "name": "Иван Иванов",
  "email": "student@example.com",
  "role": "student",
  "grade": "10",
  "class": "A",
  "school": "НИШ Астана",
  "created_at": "2023-01-01T00:00:00Z",
  "last_login": "2023-05-10T12:34:56Z"
}`, 'user-response')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'user-response' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'user-response' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Пример запроса</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`curl -X POST https://samga.top/v1/user \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`curl -X POST https://samga.top/v1/user \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`, 'user-request')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'user-request' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'user-request' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          {apiError && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                              <p className="font-medium">Ошибка API:</p>
                              <p>{apiError}</p>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <Button 
                              onClick={() => fetchApiData('user')}
                              disabled={isLoading}
                              className="h-8 text-xs"
                            >
                              {isLoading ? 'Загрузка...' : 'Выполнить тестовый запрос'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Grades Endpoint */}
                    <div className="border rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/80"
                        onClick={() => toggleEndpoint('grades')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded font-medium">GET</span>
                          <code className="text-sm font-semibold">/api/v1/grades</code>
                        </div>
                        <ArrowDown 
                          size={16} 
                          className={`text-muted-foreground transition-transform ${expandedEndpoint === 'grades' ? 'rotate-180' : ''}`} 
                        />
                      </div>
                      
                      {expandedEndpoint === 'grades' && (
                        <div className="p-3 border-t animate-slide-down">
                          <p className="text-sm mb-3">
                            Получение оценок пользователя по всем предметам. Можно фильтровать по семестру/четверти.
                          </p>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Параметры запроса</h4>
                            <div className="border-t border-muted">
                              <div className="flex py-2 text-sm">
                                <div className="font-medium w-24">term</div>
                                <div className="flex-1">
                                  <span className="opacity-70">string, опционально</span>
                                  <p className="text-xs mt-1 opacity-70">ID семестра/четверти для фильтрации оценок</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ответ</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`{
  "student_id": "1234567890",
  "term": "current",
  "subjects": [
    {
      "id": "math101",
      "name": "Математика",
      "teacher": "Петрова А.И.",
      "grades": [
        { "date": "2023-05-01", "value": 5, "comment": "Контрольная работа" },
        { "date": "2023-05-05", "value": 4, "comment": "Домашнее задание" }
      ],
      "average": 4.7
    },
    {
      "id": "phys101",
      "name": "Физика",
      "teacher": "Смирнов К.П.",
      "grades": [
        { "date": "2023-05-02", "value": 4, "comment": "Лабораторная работа" },
        { "date": "2023-05-07", "value": 5, "comment": "Проект" }
      ],
      "average": 4.3
    }
  ],
  "overall_average": 4.6,
  "updated_at": "2023-05-15T16:30:00Z"
}`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`{
  "student_id": "1234567890",
  "term": "current",
  "subjects": [
    {
      "id": "math101",
      "name": "Математика",
      "teacher": "Петрова А.И.",
      "grades": [
        { "date": "2023-05-01", "value": 5, "comment": "Контрольная работа" },
        { "date": "2023-05-05", "value": 4, "comment": "Домашнее задание" }
      ],
      "average": 4.7
    },
    {
      "id": "phys101",
      "name": "Физика",
      "teacher": "Смирнов К.П.",
      "grades": [
        { "date": "2023-05-02", "value": 4, "comment": "Лабораторная работа" },
        { "date": "2023-05-07", "value": 5, "comment": "Проект" }
      ],
      "average": 4.3
    }
  ],
  "overall_average": 4.6,
  "updated_at": "2023-05-15T16:30:00Z"
}`, 'grades-response')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'grades-response' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'grades-response' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Пример запроса</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`curl -X POST https://samga.top/v1/grades?term=2023-1 \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`curl -X POST https://samga.top/v1/grades?term=2023-1 \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`, 'grades-request')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'grades-request' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'grades-request' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          {apiError && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                              <p className="font-medium">Ошибка API:</p>
                              <p>{apiError}</p>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <Button 
                              onClick={() => fetchApiData('grades')}
                              disabled={isLoading}
                              className="h-8 text-xs"
                            >
                              {isLoading ? 'Загрузка...' : 'Выполнить тестовый запрос'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Schedule Endpoint */}
                    <div className="border rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/80"
                        onClick={() => toggleEndpoint('schedule')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded font-medium">GET</span>
                          <code className="text-sm font-semibold">/api/v1/schedule</code>
                        </div>
                        <ArrowDown 
                          size={16} 
                          className={`text-muted-foreground transition-transform ${expandedEndpoint === 'schedule' ? 'rotate-180' : ''}`} 
                        />
                      </div>
                      
                      {expandedEndpoint === 'schedule' && (
                        <div className="p-3 border-t animate-slide-down">
                          <p className="text-sm mb-3">
                            Получение расписания уроков на указанную дату или текущий день.
                          </p>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Параметры запроса</h4>
                            <div className="border-t border-muted">
                              <div className="flex py-2 text-sm">
                                <div className="font-medium w-24">date</div>
                                <div className="flex-1">
                                  <span className="opacity-70">string, опционально</span>
                                  <p className="text-xs mt-1 opacity-70">Дата в формате YYYY-MM-DD. По умолчанию - текущая дата</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ответ</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`{
  "student_id": "1234567890",
  "date": "2023-05-10",
  "day_of_week": "Среда",
  "lessons": [
    {
      "id": "lesson1",
      "number": 1,
      "time": "08:30 - 09:15",
      "subject": "Математика",
      "room": "304",
      "teacher": "Петрова А.И.",
      "homework": "Упражнения 45-48, стр. 123"
    },
    {
      "id": "lesson2",
      "number": 2,
      "time": "09:25 - 10:10",
      "subject": "Физика",
      "room": "210",
      "teacher": "Смирнов К.П.",
      "homework": "Параграф 12, ответить на вопросы"
    }
  ],
  "events": [
    {
      "id": "event1",
      "time": "15:00 - 16:30",
      "title": "Факультатив по математике",
      "room": "310"
    }
  ],
  "notes": "Не забудьте сдать дневники на проверку"
}`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`{
  "student_id": "1234567890",
  "date": "2023-05-10",
  "day_of_week": "Среда",
  "lessons": [
    {
      "id": "lesson1",
      "number": 1,
      "time": "08:30 - 09:15",
      "subject": "Математика",
      "room": "304",
      "teacher": "Петрова А.И.",
      "homework": "Упражнения 45-48, стр. 123"
    },
    {
      "id": "lesson2",
      "number": 2,
      "time": "09:25 - 10:10",
      "subject": "Физика",
      "room": "210",
      "teacher": "Смирнов К.П.",
      "homework": "Параграф 12, ответить на вопросы"
    }
  ],
  "events": [
    {
      "id": "event1",
      "time": "15:00 - 16:30",
      "title": "Факультатив по математике",
      "room": "310"
    }
  ],
  "notes": "Не забудьте сдать дневники на проверку"
}`, 'schedule-response')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'schedule-response' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'schedule-response' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Пример запроса</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`curl -X POST https://samga.top/v1/schedule?date=2023-05-10 \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`curl -X POST https://samga.top/v1/schedule?date=2023-05-10 \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`, 'schedule-request')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'schedule-request' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'schedule-request' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          {apiError && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                              <p className="font-medium">Ошибка API:</p>
                              <p>{apiError}</p>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <Button 
                              onClick={() => fetchApiData('schedule', {date: '2023-05-10'})}
                              disabled={isLoading}
                              className="h-8 text-xs"
                            >
                              {isLoading ? 'Загрузка...' : 'Выполнить тестовый запрос'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Notifications Endpoint */}
                    <div className="border rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/80"
                        onClick={() => toggleEndpoint('notifications')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 text-xs rounded font-medium">POST</span>
                          <code className="text-sm font-semibold">/api/v1/notifications</code>
                        </div>
                        <ArrowDown 
                          size={16} 
                          className={`text-muted-foreground transition-transform ${expandedEndpoint === 'notifications' ? 'rotate-180' : ''}`} 
                        />
                      </div>
                      
                      {expandedEndpoint === 'notifications' && (
                        <div className="p-3 border-t animate-slide-down">
                          <p className="text-sm mb-3">
                            Отправка уведомлений пользователю. С помощью этого API можно отправлять уведомления
                            на устройства пользователя.
                          </p>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Тело запроса</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`{
  "title": "Новое уведомление",
  "message": "Содержание уведомления",
  "type": "info",  // "info", "warning", "error"
  "action_url": "https://example.com/action" // опционально
}`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`{
  "title": "Новое уведомление",
  "message": "Содержание уведомления",
  "type": "info",  // "info", "warning", "error"
  "action_url": "https://example.com/action" // опционально
}`, 'notifications-body')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'notifications-body' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'notifications-body' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ответ</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`{
  "success": true,
  "notification_id": "notification_123456",
  "sent_at": "2023-05-15T16:30:00Z"
}`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`{
  "success": true,
  "notification_id": "notification_123456",
  "sent_at": "2023-05-15T16:30:00Z"
}`, 'notifications-response')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'notifications-response' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'notifications-response' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Пример запроса</h4>
                            <div className="relative">
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">{`curl -X POST https://samga.top/v1/notifications \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Новое уведомление",
    "message": "Содержание уведомления",
    "type": "info",
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`}</pre>
                              <Button 
                                onClick={() => copyCodeToClipboard(`curl -X POST https://samga.top/v1/notifications \\
  -H "Authorization: Bearer samga_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Новое уведомление",
    "message": "Содержание уведомления",
    "type": "info",
    "iin": "XXXXXXXXXX",
    "password": "your_password"
  }'`, 'notifications-request')} 
                                className={`absolute top-2 right-2 h-6 w-6 p-0 ${copyCodeSuccess === 'notifications-request' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                                title="Копировать"
                              >
                                {copyCodeSuccess === 'notifications-request' ? '✓' : <Copy size={12} />}
                              </Button>
                            </div>
                          </div>
                          
                          {apiError && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                              <p className="font-medium">Ошибка API:</p>
                              <p>{apiError}</p>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <Button 
                              onClick={() => fetchApiData('notifications', {
                                title: "Тестовое уведомление",
                                message: "Это тестовое уведомление из документации API",
                                type: "info"
                              })}
                              disabled={isLoading}
                              className="h-8 text-xs"
                            >
                              {isLoading ? 'Загрузка...' : 'Выполнить тестовый запрос'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="animate-slide-up animation-delay-300">
                  <h3 className="font-semibold text-lg">Коды состояния</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-16 text-green-600 font-medium">200</span>
                      <span>Успешный запрос</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-yellow-600 font-medium">400</span>
                      <span>Неверный запрос - проверьте формат и параметры</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-red-600 font-medium">401</span>
                      <span>Не авторизован - неверный или отсутствующий API ключ</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-red-600 font-medium">403</span>
                      <span>Запрещено - у API ключа нет доступа к запрашиваемому ресурсу</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-red-600 font-medium">404</span>
                      <span>Не найдено - запрашиваемый ресурс не существует</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-red-600 font-medium">429</span>
                      <span>Слишком много запросов - превышен лимит API</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-red-600 font-medium">500</span>
                      <span>Внутренняя ошибка сервера</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="animate-fade-in animation-delay-150">
          <Card>
            <CardHeader>
              <CardTitle>Примеры использования</CardTitle>
              <CardDescription>
                Примеры кода для интеграции SAMGA API в ваши проекты
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="python">
                <TabsList>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>
                
                <TabsContent value="python" className="mt-4 animate-fade-in">
                  <div className="bg-muted p-4 rounded-lg text-sm font-mono relative">
                    <pre>{`import requests

# Ваш API ключ
API_KEY = "samga_your_api_key_here"

# Учетные данные пользователя
IIN = "XXXXXXXXXXX"
PASSWORD = "your_password"

# Базовый URL API
BASE_URL = "https://samga.top/v1"

# Заголовки запроса
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Получение данных пользователя
def get_user_info():
    data = {
        "iin": IIN,
        "password": PASSWORD
    }
    response = requests.post(f"{BASE_URL}/user", headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code, "message": response.text}

# Получение оценок
def get_grades(term_id=None):
    url = f"{BASE_URL}/grades"
    data = {
        "iin": IIN,
        "password": PASSWORD
    }
    if term_id:
        data["term"] = term_id
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code, "message": response.text}

# Получение расписания
def get_schedule(date=None):
    url = f"{BASE_URL}/schedule"
    data = {
        "iin": IIN,
        "password": PASSWORD
    }
    if date:
        data["date"] = date  # Формат: YYYY-MM-DD
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code, "message": response.text}

# Отправка уведомления
def send_notification(title, message, type="info", action_url=None):
    data = {
        "iin": IIN,
        "password": PASSWORD,
        "title": title,
        "message": message,
        "type": type
    }
    if action_url:
        data["action_url"] = action_url
        
    response = requests.post(f"{BASE_URL}/notifications", 
                            headers=headers, 
                            json=data)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code, "message": response.text}

# Пример использования
user_info = get_user_info()
print(f"Имя пользователя: {user_info.get('name')}")

grades = get_grades()
print(f"Количество предметов: {len(grades.get('subjects', []))}")

schedule = get_schedule("2023-05-10")
print(f"Уроков на день: {len(schedule.get('lessons', []))}")

# Отправка тестового уведомления
result = send_notification(
    "Напоминание", 
    "Завтра контрольная работа по математике", 
    "warning"
)
print(f"Уведомление отправлено: {result.get('success', False)}")`}</pre>
                    <Button 
                      onClick={() => copyCodeToClipboard(document.querySelector('pre')?.textContent || '', 'python-example')}
                      className={`absolute top-2 right-2 h-7 px-2 ${copyCodeSuccess === 'python-example' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                      title="Копировать весь код"
                    >
                      {copyCodeSuccess === 'python-example' ? 'Скопировано ✓' : <><Copy size={12} /> <span className="ml-1 text-xs">Копировать</span></>}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="javascript" className="mt-4 animate-fade-in">
                  <div className="bg-muted p-4 rounded-lg text-sm font-mono relative">
                    <pre>{`// Ваш API ключ
const API_KEY = "samga_your_api_key_here";

// Учетные данные пользователя
const IIN = "XXXXXXXXXXX";
const PASSWORD = "your_password";

// Базовый URL API
const BASE_URL = "https://samga.top/v1";

// Заголовки запроса
const headers = {
  "Authorization": \`Bearer \${API_KEY}\`,
  "Content-Type": "application/json"
};

// Получение данных пользователя
async function getUserInfo() {
  try {
    const response = await fetch(\`\${BASE_URL}/user\`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        iin: IIN,
        password: PASSWORD
      })
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      return { error: response.status, message: await response.text() };
    }
  } catch (error) {
    return { error: "network_error", message: error.message };
  }
}

// Получение оценок
async function getGrades(termId = null) {
  const data = {
    iin: IIN,
    password: PASSWORD
  };
  
  if (termId) {
    data.term = termId;
  }
  
  try {
    const response = await fetch(\`\${BASE_URL}/grades\`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      return { error: response.status, message: await response.text() };
    }
  } catch (error) {
    return { error: "network_error", message: error.message };
  }
}

// Получение расписания
async function getSchedule(date = null) {
  const data = {
    iin: IIN,
    password: PASSWORD
  };
  
  if (date) {
    data.date = date;  // Формат: YYYY-MM-DD
  }
  
  try {
    const response = await fetch(\`\${BASE_URL}/schedule\`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      return { error: response.status, message: await response.text() };
    }
  } catch (error) {
    return { error: "network_error", message: error.message };
  }
}

// Отправка уведомления
async function sendNotification(title, message, type = "info", actionUrl = null) {
  const data = {
    iin: IIN,
    password: PASSWORD,
    title,
    message,
    type
  };
  
  if (actionUrl) {
    data.action_url = actionUrl;
  }
  
  try {
    const response = await fetch(\`\${BASE_URL}/notifications\`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      return { error: response.status, message: await response.text() };
    }
  } catch (error) {
    return { error: "network_error", message: error.message };
  }
}

// Пример использования
async function main() {
  const userInfo = await getUserInfo();
  console.log(\`Имя пользователя: \${userInfo.name}\`);
  
  const grades = await getGrades();
  console.log(\`Количество предметов: \${grades.subjects?.length || 0}\`);
  
  const schedule = await getSchedule("2023-05-10");
  console.log(\`Уроков на день: \${schedule.lessons?.length || 0}\`);
  
  // Отправка тестового уведомления
  const result = await sendNotification(
    "Напоминание", 
    "Завтра контрольная работа по математике",
    "warning"
  );
  console.log(\`Уведомление отправлено: \${result.success || false}\`);
}

main();`}</pre>
                    <Button 
                      onClick={() => copyCodeToClipboard(document.querySelectorAll('pre')[1]?.textContent || '', 'js-example')}
                      className={`absolute top-2 right-2 h-7 px-2 ${copyCodeSuccess === 'js-example' ? 'bg-green-500 text-white' : 'bg-muted/80'}`}
                      title="Копировать весь код"
                    >
                      {copyCodeSuccess === 'js-example' ? 'Скопировано ✓' : <><Copy size={12} /> <span className="ml-1 text-xs">Копировать</span></>}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                Библиотеки для различных языков программирования доступны для скачивания.
              </p>
              <Button className="flex items-center gap-1 h-8 px-3">
                <span>Скачать SDK</span>
                <ArrowRight size={14} />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes popIn {
          0% { transform: scale(0.96); opacity: 0; }
          60% { transform: scale(1.01); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes delete {
          0% { transform: scale(1); opacity: 1; }
          15% { transform: scale(1.01); }
          100% { transform: scale(0.92); opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.25s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slideDown 0.2s ease-out forwards;
        }
        
        .animate-pop-in {
          animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .animate-delete {
          animation: delete 0.35s cubic-bezier(0.34, 0.07, 0.64, 0.97) forwards;
        }
        
        .animation-delay-50 {
          animation-delay: 50ms;
        }
        
        .animation-delay-100 {
          animation-delay: 70ms;
        }
        
        .animation-delay-150 {
          animation-delay: 90ms;
        }
        
        .animation-delay-200 {
          animation-delay: 110ms;
        }
        
        .animation-delay-300 {
          animation-delay: 130ms;
        }
      `}</style>
    </div>
  )
}

export default DevPage 