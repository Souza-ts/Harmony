/**
 * Harmony Player - Service Worker
 * Versão: 2.0.0
 */

const CACHE_NAME = 'harmony-player-v2.0.0';
const DYNAMIC_CACHE = 'harmony-dynamic-v2.0.0';

// Arquivos para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  
  // Ícones
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
  
  // Fontes (opcional - pode usar CDN)
  '/assets/fonts/Inter.woff2',
  '/assets/fonts/Poppins.woff2',
  
  // Música padrão
  '/musica.mp3',
  '/cover.jpg'
];

// Estratégia de cache: Cache First com fallback para network
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache apenas respostas válidas
    if (networkResponse.ok && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback para página offline
    if (request.destination === 'document') {
      return cache.match('/index.html');
    }
    
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Estratégia para áudio: Network First com cache como fallback
const audioFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // Cache de áudio para uso offline
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Audio unavailable offline', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Instalação completa');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Limpar caches antigos
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              console.log('[Service Worker] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Ativação completa');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições para APIs externas e analytics
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Estratégias diferentes para tipos de conteúdo
  if (event.request.destination === 'audio') {
    event.respondWith(audioFirst(event.request));
  } else if (event.request.destination === 'image' && url.pathname.includes('cover')) {
    // Cache de capas de álbum
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

// Mensagens do Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background Sync para funcionalidades offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-playback') {
    console.log('[Service Worker] Sincronizando dados de reprodução...');
    event.waitUntil(syncPlaybackData());
  }
});

// Periodic Background Sync para atualizações
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    console.log('[Service Worker] Verificando atualizações...');
    event.waitUntil(updateContent());
  }
});

// Função de sincronização de dados de reprodução
async function syncPlaybackData() {
  try {
    // Aqui você sincronizaria dados com um servidor
    console.log('[Service Worker] Dados de reprodução sincronizados');
  } catch (error) {
    console.error('[Service Worker] Erro na sincronização:', error);
  }
}

// Função de atualização de conteúdo
async function updateContent() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = STATIC_ASSETS;
    
    for (const request of requests) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          await cache.put(request, networkResponse);
        }
      } catch (error) {
        console.warn(`[Service Worker] Não foi possível atualizar: ${request}`, error);
      }
    }
    
    console.log('[Service Worker] Conteúdo atualizado');
  } catch (error) {
    console.error('[Service Worker] Erro na atualização:', error);
  }
}

// Notificações push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nova notificação do Harmony Player',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'harmony-notification'
    },
    actions: [
      {
        action: 'play',
        title: '▶️ Reproduzir',
        icon: '/assets/icons/play-96x96.png'
      },
      {
        action: 'close',
        title: '✖️ Fechar',
        icon: '/assets/icons/close-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Harmony Player', options)
  );
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'play') {
    // Enviar mensagem para reproduzir música
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return clients.openWindow('/');
        })
        .then((client) => {
          client.postMessage({ action: 'play' });
        })
    );
  } else {
    // Abrir o app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return clients.openWindow('/');
        })
    );
  }
});