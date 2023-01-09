import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
/**
 * Debug
 */
// const gui = new dat.GUI()

const parameters = {
    materialColor: '#0a4466'
}

// gui
//     .addColor(parameters, 'materialColor')
//     .onChange(()=> {material.color.set(parameters.materialColor)})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: '#ff0000' })
// )
// scene.add(cube)

//objects 

//texture
const textureLoader = new THREE.TextureLoader
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter


//material
// const material = new THREE.MeshToonMaterial({
//     color:parameters.materialColor,
//     gradientMap: gradientTexture
// })


 const material = new THREE.MeshPhongMaterial({
         color:parameters.materialColor,
         transparent : true,
         alpha : 1,
         emissive: '#85586F',
         specular: '#ffffff'
     })

//meshes
const objectDistance = 4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1,0.4,16,60),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1,2,32),
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8,0.35,100,16),
    material
)

mesh1.position.y = - objectDistance * 0
mesh2.position.y =  -objectDistance * 1
mesh3.position.y =  -objectDistance * 2

mesh1.position.x = 1.5
mesh2.position.x = -2
mesh3.position.x = 1.7


scene.add(mesh1,mesh2,mesh3)

const sectionMeshes = [mesh1,mesh2,mesh3]
 
const raycaster = new THREE.Raycaster()

//particles
//geometry
const particlesCount =20000
const positions = new Float32Array(particlesCount * 3)

for(let i=0; i< particlesCount ; i++){
    positions[i * 3 +0 ] = (Math.random() - 0.5) * 10
    positions[i * 3 +1 ] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length
    positions[i * 3 +2] = (Math.random()- 0.5) * 10
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3))

//material


const particlesMaterial = new THREE.PointsMaterial({
    color: '#85586F',
    sizeAttenuation: true,
    size: 0.019,
})

const particles = new THREE.Points(particlesGeometry,particlesMaterial)
scene.add(particles)

//lights

const directionalLight = new THREE.DirectionalLight('#ffffff',1)
directionalLight.position.set(1,1,0)
scene.add(directionalLight)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


//mouse
const mouse = new THREE.Vector2()
window.addEventListener('mousemove',(e) =>
{
    mouse.x = e.clientX / sizes.width * 2 - 1
    mouse.y = - (e.clientY / sizes.height * 2 - 1)
})

window.addEventListener('click', () => {
    if(currentInterSect){
        if(currentInterSect.object  === mesh1){
            console.log('clicked on mesh1')
        }else if(currentInterSect.object  === mesh2){
            console.log('clicked on object 2')
        }
        else if(currentInterSect.object  === mesh3){
            console.log('clicked on object 3')
        }
    }
})


/**
 * Camera
 */

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)


// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha :true 
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//SCROLL

let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', ()=> {
    scrollY = window.scrollY 
    const newSection = Math.round(scrollY / sizes.height)
    console.log(newSection)
    if(newSection != currentSection){
        currentSection = newSection
        
        gsap.to(
            sectionMeshes[currentSection].rotation,{
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=4',
                y: '+=2',
                z: '+=1'
            }
        )
    }

})

//cursor
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove',(event)=>{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})



/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

let currentInterSect = null
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    //animate camera
    camera.position.y = -scrollY  / sizes.height * objectDistance

     const parallaxX = - cursor.x * 0.5
     const parallaxY =  cursor.y * 0.5
     cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 *deltaTime
     cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 *deltaTime

    //animate
    for(const mesh of sectionMeshes){
        mesh.rotation.y += deltaTime * 0.2
        mesh.rotation.x += deltaTime * 0.12
    }

    //raycasting
    raycaster.setFromCamera(mouse,camera)
 

    const objectsToTest = [mesh1,mesh2,mesh3]
    const intersects = raycaster.intersectObjects(objectsToTest)


    for(const intersect of intersects){
        gsap.to(
            intersect.object.rotation,{
                duration: 1,
                ease: 'circ.easeIn',
                y: '+=1'     
            }
        )
    }


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()