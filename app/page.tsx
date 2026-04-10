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
  Link as LinkIcon,
  FileText,
  ShoppingBasket,
  ChefHat,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'

type View = 'home' | 'category' | 'recipe'
type ModalStep = 'choices' | 'link' | 'text' | 'loading' | 'done-link' | 'done-text'

interface RecipeMeta {
  title: string
  file: string
}

interface Recipe {
  title: string
  ingredients: string
  instructions: string
  source_url?: string
}

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
  const [recipeList, setRecipeList] = useState<RecipeMeta[]>([])
  const [recipeListLoading, setRecipeListLoading] = useState(false)
  const [recipeListError, setRecipeListError] = useState(false)
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [backCategory, setBackCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('choices')
  const [recipeUrl, setRecipeUrl] = useState('')
  const [recipeText, setRecipeText] = useState('')
  const [doneName, setDoneName] = useState('')

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
      const res = await fetch('/recipes/category_index.json')
      if (!res.ok) throw new Error()
      const index = await res.json()
      setRecipeList(index[category] || [])
    } catch {
      setRecipeListError(true)
    }
    setRecipeListLoading(false)
  }

  const showRecipeDetail = async (filename: string, category: string) => {
    setBackCategory(category)
    setCurrentRecipe(null)
    setRecipeLoading(true)
    setView('recipe')
    window.scrollTo(0, 0)
    try {
      const res = await fetch(`/recipes/${filename}`)
      if (!res.ok) throw new Error()
      const recipe = await res.json()
      setCurrentRecipe(recipe)
    } catch {
      setCurrentRecipe({ title: 'שגיאה בטעינה', ingredients: '', instructions: '' })
    }
    setRecipeLoading(false)
  }

  const openAddRecipe = () => {
    setModalStep('choices')
    setRecipeUrl('')
    setRecipeText('')
    setDoneName('')
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const startExtraction = () => {
    if (!recipeUrl) { alert('נא להזין קישור'); return }
    setModalStep('loading')
    setTimeout(() => setModalStep('done-link'), 2500)
  }

  const saveTextRecipe = () => {
    const raw = recipeText.trim()
    if (!raw) { alert('נא להדביק את המתכון'); return }
    const lines = raw.split('\n')
    const name = lines[0].trim()
    const remaining = lines.slice(1).join('\n').trim()
    if (!name || !remaining) { alert('נא לוודא שיש שם מתכון בשורה הראשונה ותוכן בהמשך'); return }
    setDoneName(name)
    setModalStep('loading')
    setTimeout(() => setModalStep('done-text'), 2000)
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
              key={recipe.file}
              className="recipe-item"
              onClick={() => showRecipeDetail(recipe.file, currentCategory)}
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
            <div className="section-content">{currentRecipe?.ingredients ?? ''}</div>
          </div>

          <div className="recipe-section">
            <div className="section-title">
              <ChefHat />
              <span>אופן ההכנה</span>
            </div>
            <div className="section-content">{currentRecipe?.instructions ?? ''}</div>
          </div>

          {currentRecipe?.source_url && (
            <div className="recipe-source">
              <a href={currentRecipe.source_url} target="_blank" rel="noreferrer" className="source-link">
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

          {modalStep === 'choices' && (
            <div className="modal-choices">
              <button className="choice-btn" onClick={() => setModalStep('link')}>
                <LinkIcon size={48} />
                <span>הוספת קישור</span>
              </button>
              <button className="choice-btn" onClick={() => setModalStep('text')}>
                <FileText size={48} />
                <span>הוספת מתכון (טקסט)</span>
              </button>
            </div>
          )}

          {modalStep === 'link' && (
            <div className="input-group active">
              <input
                type="text"
                className="input-field"
                placeholder="הדבק כאן את הקישור למתכון..."
                dir="ltr"
                value={recipeUrl}
                onChange={(e) => setRecipeUrl(e.target.value)}
              />
              <button className="primary-btn" onClick={startExtraction}>
                חלץ מתכון
              </button>
            </div>
          )}

          {modalStep === 'text' && (
            <div className="input-group active">
              <textarea
                className="input-field"
                style={{ minHeight: '300px', resize: 'vertical' }}
                placeholder="הדבק כאן את המתכון המלא... (השורה הראשונה תהיה שם המתכון)"
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
              />
              <button className="primary-btn" onClick={saveTextRecipe}>
                שמר מתכון
              </button>
            </div>
          )}

          {modalStep === 'loading' && (
            <div className="loading-container" style={{ display: 'flex' }}>
              <div className="spinner" />
              <p>מחלץ נתונים... אנא המתן</p>
            </div>
          )}

          {modalStep === 'done-link' && (
            <div className="loading-container" style={{ display: 'flex' }}>
              <div style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>
                <CheckCircle size={48} />
              </div>
              <p>המתכון זוהה בהצלחה!</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
                כעת שלח את הקישור לסוכן ה-AI בשיחה כדי לעדכן את המערכת.
              </p>
              <button className="primary-btn" style={{ marginTop: '1.5rem' }} onClick={closeModal}>
                סגור
              </button>
            </div>
          )}

          {modalStep === 'done-text' && (
            <div className="loading-container" style={{ display: 'flex' }}>
              <div style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>
                <CheckCircle size={48} />
              </div>
              <p>המתכון נשמר בהצלחה!</p>
              <p style={{ fontSize: '1.1rem', color: 'var(--accent-color)', marginTop: '0.5rem' }}>
                {doneName}
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
                כעת שלח את הטקסט המלא לסוכן ה-AI בשיחה כדי לעדכן את המערכת.
              </p>
              <button className="primary-btn" style={{ marginTop: '1.5rem' }} onClick={closeModal}>
                סגור
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
