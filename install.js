if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./serviceworkers.js").then(function (){
        console.log("Registred")
    });
}