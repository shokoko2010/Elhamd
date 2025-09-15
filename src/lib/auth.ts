import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { useState, useEffect } from 'react'
import { UserService } from './firestore'
import { User, UserRole } from './firestore'
import { auth } from './firebase'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  phone?: string | null
}

class AuthService {
  private currentUser: AuthUser | null = null
  private authStateChangedListeners: ((user: AuthUser | null) => void)[] = []

  constructor() {
    // Listen to auth state changes
    if (auth) {
      onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const user = await this.mapFirebaseUserToAuthUser(firebaseUser)
          this.currentUser = user
          this.notifyAuthStateChangedListeners(user)
        } else {
          this.currentUser = null
          this.notifyAuthStateChangedListeners(null)
        }
      })
    }
  }

  private async mapFirebaseUserToAuthUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
    // Get additional user data from Firestore
    const userData = await UserService.getUserByEmail(firebaseUser.email!)
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: userData?.role || UserRole.CUSTOMER,
      phone: userData?.phone || firebaseUser.phoneNumber
    }
  }

  private notifyAuthStateChangedListeners(user: AuthUser | null) {
    this.authStateChangedListeners.forEach(listener => listener(user))
  }

  onAuthStateChanged(listener: (user: AuthUser | null) => void) {
    this.authStateChangedListeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateChangedListeners.indexOf(listener)
      if (index > -1) {
        this.authStateChangedListeners.splice(index, 1)
      }
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  async signUp(email: string, password: string, name: string, role: UserRole = UserRole.CUSTOMER, phone?: string): Promise<AuthUser> {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized')
      }
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, { displayName: name })

      // Create user document in Firestore
      await UserService.createUser({
        email,
        name,
        role,
        phone
      })

      return this.mapFirebaseUserToAuthUser(firebaseUser)
    } catch (error) {
      console.error('Sign up error:', error)
      throw this.handleAuthError(error)
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized')
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Update last login timestamp
      const userData = await UserService.getUserByEmail(email)
      if (userData) {
        await UserService.updateUser(userData.id!, { updatedAt: new Date() as any })
      }

      return this.mapFirebaseUserToAuthUser(firebaseUser)
    } catch (error) {
      console.error('Sign in error:', error)
      throw this.handleAuthError(error)
    }
  }

  async signOut(): Promise<void> {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized')
      }
      
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw this.handleAuthError(error)
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized')
      }
      
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Reset password error:', error)
      throw this.handleAuthError(error)
    }
  }

  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication'

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email address is already in use'
        break
      case 'auth/invalid-email':
        message = 'Invalid email address'
        break
      case 'auth/operation-not-allowed':
        message = 'Operation not allowed'
        break
      case 'auth/weak-password':
        message = 'Password is too weak'
        break
      case 'auth/user-disabled':
        message = 'User account has been disabled'
        break
      case 'auth/user-not-found':
        message = 'User not found'
        break
      case 'auth/wrong-password':
        message = 'Incorrect password'
        break
      case 'auth/too-many-requests':
        message = 'Too many requests. Please try again later'
        break
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection'
        break
      default:
        message = error.message || message
    }

    return new Error(message)
  }

  // Role-based authorization
  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN)
  }

  isStaff(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.STAFF])
  }

  isCustomer(): boolean {
    return this.hasRole(UserRole.CUSTOMER)
  }
}

// Export singleton instance
export const authService = new AuthService()

// React hook for authentication
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    user,
    loading,
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    hasAnyRole: authService.hasAnyRole.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    isStaff: authService.isStaff.bind(authService),
    isCustomer: authService.isCustomer.bind(authService)
  }
}