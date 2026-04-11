'use client'

import { useState } from 'react'
import {
  UtensilsCrossed,
  Soup,
  Salad,
  Croissant,
  Drumstick,
  Fish,
  CakeSlice,
  Plus,
  ChevronRight,
  ChevronLeft,
  ShoppingBasket,
  ChefHat,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { getRecipesByCategory, getRecipeById, addRecipe } from './actions'
import type { Recipe } from '@/db/schema'

type View = 'home' | 'category' | 'recipe'
type ModalStep = 'form' | 'loading' | 'done'

const CATEGORIES = [
  { name: 'מרקים', icon: <Soup size={32} /> },
  { name: 'סלטים וירקות', icon: <Salad size={48} /> },
  { name: 'מאפים', icon: <Croissant size={32} /> },
  { name: 'בשר ועוף', icon: <Drumstick size={32} /> },
  { name: 'דגים', icon: <Fish size={32} /> },
  { name: 'מתוקים', icon: <CakeSlice size={32} /> },
]

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [currentCategory, setCurrentCategory] = useState('')
  const [recipeList, setRecipeList] = useState<Recipe[]>([])
  const [recipeListLoading, setRecipeListLoading] = useState(false)
  const [recipeListError, setRecipeListError] = useState(false)
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [backCategory, setBackCategory] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('form')
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    ingredients: '',
    instructions: '',
    sourceUrl: ''
  })

  const showHome = () => {
    setView('home')
    window.scrollTo(0, 0)
  }

  const showCategory = async (category: string) => {
    setCurrentCategory(category)
    setRecipeListLoading(true)
    setRecipeListError(false)
    setRecipeList([])
    setView('category')
    window.scrollTo(0, 0)
    try {
      const recipes = await getRecipesByCategory(category)
      setRecipeList(recipes)
    } catch (err) {
      console.error(err)
      setRecipeListError(true)
    }
    setRecipeListLoading(false)
  }

  const showRecipeDetail = async (id: number, category: string) => {
    setBackCategory(category)
    setCurrentRecipe(null)
    setRecipeLoading(true)
    setView('recipe')
    window.scrollTo(0, 0)
    try {
      const recipe = await getRecipeById(id)
      setCurrentRecipe(recipe)
    } catch {
      // Fallback or error handled in UI
    }
    setRecipeLoading(false)
  }

  const openAddRecipe = () => {
    setModalStep('form')
    setFormData({
      title: '',
      category: currentCategory || CATEGORIES[0].name,
      ingredients: '',
      instructions: '',
      sourceUrl: ''
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    if (modalStep === 'done') {
      // Refresh list if we are in category view
      if (view === 'category') {
        showCategory(currentCategory)
      }
    }
  }

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.category || !formData.ingredients || !formData.instructions) {
      alert('נא למלא את כל שדות החובה')
      return
    }
    
    setModalStep('loading')
    try {
      await addRecipe(formData)
      setModalStep('done')
    } catch (err) {
      alert('שגיאה בשמירת המתכון')
      setModalStep('form')
    }
  }

  return (
    <>
      {/* Home View */}
      <div id="home-view" className={`container${view === 'home' ? ' active' : ''}`}>
        <div className="home-header-row">
          <button className="add-recipe-btn" onClick={openAddRecipe}>
            <Plus size={32} />
            <span>הוסף מתכון</span>
          </button>
          <div className="icon-wrapper">
            <UtensilsCrossed size={40} />
          </div>
        </div>
        <h1>מתכונים</h1>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <button key={cat.name} className="category-btn" onClick={() => showCategory(cat.name)}>
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category List View */}
      <div id="category-view" className={`container${view === 'category' ? ' active' : ''}`}>
        <div className="view-header">
          <h2 style={{ fontSize: '2.2rem', margin: 0 }}>{currentCategory}</h2>
          <button className="back-btn-nav" onClick={showHome}>
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="recipe-list">
          {recipeListLoading && (
            <div style={{ opacity: 0.5, marginTop: '2rem' }}>טוען...</div>
          )}
          {recipeListError && (
            <p style={{ color: '#ef4444', marginTop: '2rem' }}>
              שגיאה בטעינת הנתונים.
            </p>
          )}
          {!recipeListLoading && !recipeListError && recipeList.length === 0 && (
            <p style={{ opacity: 0.5, marginTop: '2rem' }}>בקרוב יתווספו מתכונים לקטגוריה זו...</p>
          )}
          {recipeList.map((recipe) => (
            <button
              key={recipe.id}
              className="recipe-item"
              onClick={() => showRecipeDetail(recipe.id, currentCategory)}
            >
              <span>{recipe.title}</span>
              <ChevronLeft />
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Detail View */}
      <div id="recipe-view" className={`container${view === 'recipe' ? ' active' : ''}`}>
        <div className="recipe-card">
          <div className="recipe-header">
            <h1 className="recipe-title">
              {recipeLoading ? 'טוען...' : (currentRecipe?.title ?? '')}
            </h1>
            <button className="back-btn-nav" onClick={() => showCategory(backCategory)}>
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="recipe-section">
            <div className="section-title">
              <ShoppingBasket />
              <span>מצרכים</span>
            </div>
            <div className="section-content" style={{ whiteSpace: 'pre-wrap' }}>{currentRecipe?.ingredients ?? ''}</div>
          </div>

          <div className="recipe-section">
            <div className="section-title">
              <ChefHat />
              <span>אופן ההכנה</span>
            </div>
            <div className="section-content" style={{ whiteSpace: 'pre-wrap' }}>{currentRecipe?.instructions ?? ''}</div>
          </div>

          {currentRecipe?.sourceUrl && (
            <div className="recipe-source">
              <a href={currentRecipe.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
                <ExternalLink size={20} />
                מקור המתכון
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Add Recipe Modal */}
      <div
        id="add-recipe-modal"
        className={`modal-overlay${modalOpen ? ' active' : ''}`}
        onClick={closeModal}
      >
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h2 className="modal-title">הוספת מתכון חדש</h2>

          {modalStep === 'form' && (
            <form onSubmit={handleSaveRecipe} className="add-recipe-form">
              <div className="input-group active">
                <label className="input-label">שם המתכון</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="input-group active">
                <label className="input-label">קטגוריה</label>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group active">
                <label className="input-label">מצרכים</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: '120px' }}
                  required
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                />
              </div>

              <div className="input-group active">
                <label className="input-label">אופן ההכנה</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: '120px' }}
                  required
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                />
              </div>

              <div className="input-group active">
                <label className="input-label">קישור למקור (אופציונלי)</label>
                <input
                  type="text"
                  className="input-field"
                  dir="ltr"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
                />
              </div>

              <button type="submit" className="primary-btn" style={{ marginTop: '1rem' }}>
                שמור מתכון
              </button>
            </form>
          )}

          {modalStep === 'loading' && (
            <div className="loading-container" style={{ display: 'flex' }}>
              <div className="spinner" />
              <p>שומר מתכון... אנא המתן</p>
            </div>
          )}

          {modalStep === 'done' && (
            <div className="loading-container" style={{ display: 'flex' }}>
              <div style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>
                <CheckCircle size={48} />
              </div>
              <p>המתכון נשמר בהצלחה!</p>
              <button className="primary-btn" style={{ marginTop: '1.5rem' }} onClick={closeModal}>
                סגור
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .input-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          opacity: 0.8;
        }
        .add-recipe-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 5px;
        }
        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 10px center;
        }
      `}</style>
    </>
  )
}
