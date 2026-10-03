/* MAIA map treatment: bundled MapLibre, OpenFreeMap Positron and Terrarium relief. */
(() => {
  let enginePromise;
  function engine() {
    if(window.maplibregl)return Promise.resolve();
    if(!enginePromise)enginePromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link');css.rel='stylesheet';css.href='assets/maplibre/maplibre-gl.css';document.head.append(css);
      const script=document.createElement('script');script.src='assets/maplibre/maplibre-gl.js';
      script.onload=resolve;script.onerror=()=>{enginePromise=null;reject(new Error('Motor cartográfico no disponible'));};document.head.append(script);
    });
    return enginePromise;
  }
  function rings(shape){return typeof shape?.[0]?.[0]==='number'?[shape]:shape.flatMap(rings);}
  function geometry(shape){return {type:'MultiPolygon',coordinates:rings(shape).map(r=>[r])};}
  const simpleStyle={version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#eeeaef'}}]};
  window.AMTerritoryMap={
    mount({host,shapes,ub,name}) {
      let map=null,disposed=false,started=false,observer=null,resizeObserver=null,timer=null;
      const canvas=host.querySelector('.map-canvas'),status=host.querySelector('.map-status');
      const editorial=host.querySelector('[data-mode="editorial"]'),relief=host.querySelector('[data-mode="relief"]');
      const points=rings(shapes[ub]).flat();
      const bounds=[[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1]))],[Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]];
      const fc={type:'FeatureCollection',features:Object.entries(shapes).map(([code,shape])=>({type:'Feature',properties:{selected:code===ub?1:0},geometry:geometry(shape)}))};
      function say(message){status.replaceChildren();if(message){const span=document.createElement('span');span.textContent=message;status.append(span);}}
      function addTerritory(){
        if(disposed||!map||map.getSource('am-districts'))return;
        const labelLayer=map.getStyle().layers.find(l=>l.type==='symbol')?.id;
        map.addSource('am-districts',{type:'geojson',data:fc,attribution:'Límites INEI'});
        map.addLayer({id:'am-fill',type:'fill',source:'am-districts',paint:{'fill-color':['case',['==',['get','selected'],1],'#e00060','#eae4ec'],'fill-opacity':['case',['==',['get','selected'],1],.25,.13]}},labelLayer);
        map.addLayer({id:'am-neighbors',type:'line',source:'am-districts',paint:{'line-color':'#a398ac','line-width':.65,'line-opacity':.6}},labelLayer);
        map.addLayer({id:'am-outline',type:'line',source:'am-districts',filter:['==',['get','selected'],1],paint:{'line-color':'#d9005a','line-width':2}},labelLayer);
        editorial.disabled=false;relief.disabled=false;canvas.dataset.ready='true';say('');
      }
      function addRelief(){
        if(map.getSource('am-dem'))return;
        map.addSource('am-dem',{type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],encoding:'terrarium',tileSize:256,maxzoom:14,attribution:'Relieve: AWS Terrain Tiles'});
        const before=map.getStyle().layers.find(l=>l.type==='fill'&&/water|ocean/.test(l.id))?.id||'am-fill';
        map.addLayer({id:'am-hillshade',type:'hillshade',source:'am-dem',paint:{'hillshade-exaggeration':.28,'hillshade-shadow-color':'#5e5263','hillshade-highlight-color':'#ffffff','hillshade-accent-color':'#8a7f8f'}},before);
      }
      function mode(threeD){
        if(!map?.getSource('am-districts'))return;
        if(threeD){
          addRelief();
          if(!map.getSource('am-dem3d'))map.addSource('am-dem3d',{type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],encoding:'terrarium',tileSize:256,maxzoom:14,attribution:'Relieve: AWS Terrain Tiles'});
        }
        map.setTerrain(threeD?{source:'am-dem3d',exaggeration:1.5}:null);
        map.easeTo({pitch:threeD?52:0,bearing:threeD?-12:0,duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:550});
        editorial.setAttribute('aria-pressed',String(!threeD));relief.setAttribute('aria-pressed',String(threeD));
      }
      editorial.addEventListener('click',()=>started?mode(false):start());
      relief.addEventListener('click',()=>mode(true));
      async function start(){
        if(started||disposed)return;started=true;say('Cargando cartografía…');
        try{
          await engine();if(disposed)return;
          if(/^https?:$/.test(location.protocol))maplibregl.setWorkerUrl(new URL('assets/maplibre/maplibre-gl-csp-worker.js',location.href).href);
          canvas.style.display='block';
          map=new maplibregl.Map({container:canvas,style:simpleStyle,bounds,fitBoundsOptions:{padding:{top:105,bottom:55,left:50,right:50}},attributionControl:{compact:true},fadeDuration:0,maxPitch:65});
          map.scrollZoom.disable();map.addControl(new maplibregl.NavigationControl({showCompass:true}),'bottom-right');map.addControl(new maplibregl.ScaleControl({maxWidth:85,unit:'metric'}),'bottom-left');
          map.on('style.load',()=>{addTerritory();if(map.getStyle().sources.openmaptiles&&!matchMedia('(max-width:820px)').matches)addRelief();});
          map.on('error',()=>{if(!map?.getSource('am-districts'))say('El fondo no está disponible. Los límites del distrito siguen visibles.');});
          resizeObserver=new ResizeObserver(()=>map?.resize());resizeObserver.observe(host.querySelector('.map-art'));
          // Fetch the MAIA editorial style separately. Preserve the local map if the network is unavailable.
          const controller=new AbortController();timer=setTimeout(()=>controller.abort(),12000);
          try {const response=await fetch('https://tiles.openfreemap.org/styles/positron',{signal:controller.signal});if(!response.ok)throw Error('Style unavailable');const style=await response.json();if(!disposed)map.setStyle(style);}
          catch {if(!disposed)say('Vista local · Fondo cartográfico sin conexión');}
          finally {clearTimeout(timer);}
        }catch(error){console.warn('Mapa editorial:',error.message);canvas.style.display='none';say('Vista ligera · La consulta y las exportaciones siguen disponibles.');}
      }
      if(navigator.connection?.saveData){say('Ahorro de datos · Pulsa Editorial para cargar el mapa');editorial.disabled=false;}
      else if('IntersectionObserver' in window){observer=new IntersectionObserver(e=>{if(e.some(x=>x.isIntersecting)){observer.disconnect();start();}},{rootMargin:'0px'});observer.observe(host);}
      else start();
      return {dispose(){disposed=true;clearTimeout(timer);observer?.disconnect();resizeObserver?.disconnect();map?.remove();map=null;},resize(){map?.resize();}};
    }
  };
})();
