'use client'

import { useEffect } from 'react'

export function PwaRegistry() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return
        }

        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js')
                console.log('ServiceWorker registration successful with scope: ', registration.scope)

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing
                    if (installingWorker) {
                        installingWorker.addEventListener('statechange', () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available
                                if (confirm('إصدار جديد متاح! هل تريد تحديث الصفحة؟')) {
                                    window.location.reload()
                                }
                            }
                        })
                    }
                })
            } catch (err) {
                console.log('ServiceWorker registration failed: ', err)
            }
        }

        registerSW()

        // PWA Install Prompt
        let deferredPrompt: any
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            deferredPrompt = e

            // Show install button if desired
            if (typeof document !== 'undefined') {
                const installButton = document.getElementById('pwa-install-button')
                if (installButton) {
                    installButton.style.display = 'block'
                    installButton.addEventListener('click', () => {
                        if (deferredPrompt) {
                            deferredPrompt.prompt()
                            deferredPrompt.userChoice.then((choiceResult: any) => {
                                if (choiceResult.outcome === 'accepted') {
                                    console.log('User accepted the install prompt')
                                } else {
                                    console.log('User dismissed the install prompt')
                                }
                                deferredPrompt = null
                            })
                        }
                    })
                }
            }
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Handle app installed
        const handleAppInstalled = () => {
            console.log('PWA was installed')
            if (typeof document !== 'undefined') {
                const installButton = document.getElementById('pwa-install-button')
                if (installButton) {
                    installButton.style.display = 'none'
                }
            }
        }

        window.addEventListener('appinstalled', handleAppInstalled)

        // Handle online/offline status
        const updateOnlineStatus = () => {
            if (typeof document !== 'undefined' && document.body) {
                if (navigator.onLine) {
                    console.log('App is online')
                    document.body.classList.remove('offline')
                    document.body.classList.add('online')
                } else {
                    console.log('App is offline')
                    document.body.classList.remove('online')
                    document.body.classList.add('offline')
                }
            }
        }

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)

        // Initial check
        updateOnlineStatus()

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
            window.removeEventListener('online', updateOnlineStatus)
            window.removeEventListener('offline', updateOnlineStatus)
        }
    }, [])

    return null
}
