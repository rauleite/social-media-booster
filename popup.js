// Open: https://www.instagram.com/brazil.js/ 
let sleepPostScrollTime = 4 * 1000 // 4
let followsLimit = (Math.floor(Math.random() * 20) + 140) //Limit 160
let timeBetweenFollowing = (Math.floor(Math.random() * 20) + 20) * 1000 // 20 à 40 secs

const ENV = 'Prod'
// const ENV = 'Dev'

if (ENV !== 'Prod') {
    sleepPostScrollTime = 4 * 1000 // 4
    followsLimit = 40 //Limit 160
    timeBetweenFollowing = 4 * 1000 // 20 à 40 secs    
}

let _qtdeAmigoAdicionado = 0
let _countFixed = 0
let _$$ = $$
let _windowOrModal = window

let locationHref = window.location.href

let testTwitterVersion = _$$("div.ProfileCard-content")

const HOST = {
    isInstagram: locationHref.includes('instagram'),
    isFacebook: locationHref.includes('facebook'),
    isTwitter: locationHref.includes('twitter') && !!testTwitterVersion.length,
    isTwitterNew: locationHref.includes('twitter') && !testTwitterVersion.length,
}

// pode ser elemento ou array direto
let _queryButton = null

// Roda antes do main
// não retornei valor no queryButton, porque há delay (setTimeout) na funcao
initQuery(() => {
    // Percorre até os não seguidos
    let goUntilUnfollowed = setInterval(() => {
        if (_queryButton.length <= 0) {
            goToPageBottom()
            return
        }
        // Inicia programa
        main(sleepPostScrollTime)
        clearInterval(goUntilUnfollowed)
    }, sleepPostScrollTime / 4);
})


let main = (first) => {
    let delayClick = first || timeBetweenFollowing
    // Sleep para que seja 'computado' os elementos pós scroll
    _queryButton.every((e, i) => {
        _countFixed++
        if (shouldEndProgram(_countFixed)) return false //break every loop
        if (ENV === 'Prod') {
            setTimeout(() => {
                e.click()
                e.remove()
                console.log(`Adicionado`)
                _qtdeAmigoAdicionado++
                shouldScrollDownAndContinue(i, _queryButton.length)
            }, delayClick)
        } else {
            setTimeout(() => {
                e.remove()
                console.log(`Adicionado`)
                e
                _qtdeAmigoAdicionado++
                shouldScrollDownAndContinue(i, _queryButton.length)
            }, delayClick)
        }

        // Atrasa a cada click, assim levam o mesmo tempo entre um click e outro
        delayClick += timeBetweenFollowing
        return true
    });
}

/***
 * return Array<HttpElement>
 */
function initQuery(callback) {
    if (HOST.isInstagram) {
        instagramConfigs(() => {
            _queryButton = _$$("div[role='dialog'] button:not(._8A5w5)")
                .filter((e, i) => {
                    if (
                        e.innerText.match('Seguir') ||
                        e.innerText.match('Follow')
                    ) {
                        return e
                    }
                })
            console.log(callback)
            callback()
        })
    } else if (HOST.isFacebook) {
        _queryButton = _$$("button.FriendRequestAdd")
        callback()
    } else if (HOST.isTwitter) {
        _queryButton = _$$("div.GridTimeline-items.has-items div.not-following button.follow-text")
        callback()
    } else if (HOST.isTwitterNew) {
        _queryButton = _$$("div[aria-label*='Timeline:'] div[data-testid*='-follow']")
        callback()
    } else {
        window.alert('😱 SITE NÃO SUPORTADO.\nCertifique que está na página de seguidores.\nQualquer coisa, contate-me.')
    }
}

// Instagram precisa de configurações prévias
function instagramConfigs(callback) {
    if (HOST.isInstagram) {
        (function preCodeInstagram() {
            let clickDelayTime = 4000
            // Abre Modal e scrolla até a metade para carregar o resto
            _$$("a[href*='followers']")[0].click()
            // Desnecessário mas melhor
            // setTimeout(() => { $$("div[role='dialog']")[0].requestFullscreen() }, 2000)
            setTimeout(() => {
                let modal = _$$("div.isgrP")[0]
                modal.style.scrollBehavior = 'smooth'
                modal.scroll(0, 500)
                _windowOrModal = modal
                callback()
            }, clickDelayTime)
        })()
    }
}

// function initElem(queryButton) {
//     return typeof queryButton === 'string' ? _$$(queryButton) : runComplexyQuery() //runComplexyQuery sem uso
//     // return _$$(queryButton)
// }


function goToPageBottom(callback) {
    // _windowOrModal.scrollTo(1, document.body.scrollHeight)

    // hack para sites que fazem reflow com o old Twitter
    // _windowOrModal.scroll(1, -document.body.scrollHeight) // insta modal
    _windowOrModal.scroll(0, 0) // hack insta modal (resolve problema de reflow - redesenho de página)

    // setTimeout(() => {
    _windowOrModal.scroll(1, document.body.scrollHeight * 4) // insta modal
    // }, sleepPostScrollTime / 4)

    // if (ENV !== 'Prod') console.log('Scroll foi ativado')
    console.log('Scroll foi ativado')
    if (callback) {
        setTimeout(callback, sleepPostScrollTime)
    }
}

function shouldScrollDownAndContinue(i, length) {
    // Continua enquanto houver elementos a percorrer
    if (i < length - 1) return

    goToPageBottom(main)
}

function shouldEndProgram(_countFixed) {
    if (_countFixed <= followsLimit) return false

    if (ENV === 'Prod') {
        window.alert('Finalizando a fila, continue amanhã neste site\n🚀Adicionado ' + _qtdeAmigoAdicionado + ' amigos.')
    } else {
        console.log('Adicionado ' + _qtdeAmigoAdicionado + ' amigos.')
    }
    return true
}

// // Era usada em casos que necessitavam de um passo anterior, para montar o array de elementos
// function runComplexyQuery() {

//     if (HOST.isInstagram) {
//         return $$("div[role='dialog'] button:not(._8A5w5)")
//             .filter((e, i) => {
//                 if (
//                     e.innerText.match('Seguir') ||
//                     e.innerText.match('Follow')
//                 ) {
//                     return e
//                 }
//             })
//     }

//     // if (HOST.isTwitter) {
//     //     return _$$(" div.GridTimeline-items span.follow-button")
//     //         .filter((e, i) => {
//     //             if (
//     //                 e.innerText["match"]('Seguir') ||
//     //                 e.innerText["match"]('Follow')
//     //             ) {
//     //                 return e
//     //             }
//     //         })
//     // }
// }