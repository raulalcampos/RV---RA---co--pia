self.addEventListener("install", function(e){
    console.log("Inatalling", e);
});
self.addEventListener("activate", function(e){
    console.log("Activating", e);
    return self.clients.claim();
});
self.addEventListener("fetch", function(e){
    console.log("Fetching someting", e);
    return self.clients.claim();
});

let cacheStatic = "cache-static";
let cacheDynamic = "cache-dynamic";
let offlinePage = "./offline.html";
const cacheData = ['./index.html', './styles.css', './app.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css']

self.addEventListener("install", function (event){
    event.waitUntil(
        caches.open(cacheStatic).then(function (cache){
            cache.addAll(cacheData);
            cache.add(offlinePage);
        })
    )
})
self.addEventListener("activate", function (event){
    event.waitUntil(
        caches.keys().then(function(keyList){
            return Promise.all(keyList.map(function(key){
                if(key !== cacheStatic){
                    return caches.delete(key);
                }
            }))
        })
    )
})
self.addEventListener("fetch", function(event){
        if (event.request.mode === "navigate") {
        event.respondWith((async() => {
            try {

                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                console.log("Fetch failed; returning offline page instead.", error);
                const cache = await caches.open(cacheStatic);
                const cachedResponse = await cache.match(offlinePage);
                return cachedResponse;
            }
        })()
    );
} else {
    event.respondWith(
        caches.match(event.request).then(function(response){
            if(response){
                return response;
            } else {
                return fetch(event.request).then(function(res){
                    return caches.open(cacheDynamic).then(function(cache){
                        cache.put(event.request.url, res.clone());
                        return res;
                    })
                })
                .catch(function(err){
                    console.log(err);
                })
            }
        })
    )}
})