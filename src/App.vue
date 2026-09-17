<script setup lang="ts">
import { computed, ref } from 'vue'
import metrics from './data/metrics.json'

const questions = metrics.survey.questions
const currentIndex = ref(0)
const answers = ref<Record<string, 'yes' | 'no' | number | null>>({})
const comments = ref<Record<string, string>>({})
const uploadedImage = ref<string | null>(null)
const productPhotoName = ref('')
const starOptions = [1, 2, 3, 4, 5]

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastStep = computed(() => currentIndex.value === questions.length - 1)
const progress = computed(() => ((currentIndex.value + 1) / questions.length) * 100)
const allRequiredAnswered = computed(() =>
  questions.slice(0, -1).every((question) => {
    const value = answers.value[question.id]
    return value !== undefined && value !== null
  }),
)
const reviewEntries = computed(() =>
  questions.slice(0, -1).map((question) => ({
    id: question.id,
    label: question.text,
    value: getAnswerLabel(answers.value[question.id] ?? null),
  })),
)
const stepperSteps = computed(() =>
  questions.map((question, index) => ({
    id: question.id,
    active: index === currentIndex.value,
    complete: index < currentIndex.value,
  })),
)
const aiSummary = computed(() => {
  const answered = reviewEntries.value
    .map((entry) => `${entry.label}: ${entry.value}`)
    .join(' | ')

  return `${metrics.aiSummary.summary} Review highlights: ${answered}.`
})

const setAnswer = (value: 'yes' | 'no' | number) => {
  const key = currentQuestion.value.id
  answers.value[key] = value
}

const next = () => {
  if (currentIndex.value < questions.length - 1) {
    currentIndex.value += 1
  }
}

const back = () => {
  if (currentIndex.value > 0) currentIndex.value -= 1
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadedImage.value = URL.createObjectURL(file)
  productPhotoName.value = file.name
}

const shareFeedback = () => {
  const message = encodeURIComponent(metrics.messaging.shareText)
  window.location.href = `sms:?&body=${message}`
}

const getAnswerLabel = (value: 'yes' | 'no' | number | null) => {
  if (typeof value === 'number') {
    return `${value} star${value === 1 ? '' : 's'}`
  }
  if (!value) return 'Not answered'
  return value === 'yes' ? 'Yes' : 'No'
}
</script>

<template>
  <div class="page-shell">
    <div class="app-shell">
      <div class="phone-frame">
        <header class="top-nav">
          <button class="nav-icon menu-icon" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>

          <div class="brand-lockup">
            <div class="brand-mark">B</div>
            <span class="brand-text">Box for You</span>
          </div>

          <button class="nav-icon avatar-icon" aria-label="User account">
            <span class="avatar-circle">U</span>
          </button>
        </header>

        <main class="survey-card">
        <div class="product-header-image">
          <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80" alt="Ray-Ban style sunglasses product" />
        </div>

        <div class="product-meta">
          <h2>Ray-Ban Clubmaster</h2>
          <p>Polarized sunglasses · Black frame · 100% UV protection</p>
          <div class="delivery-status">
            <span class="status-label">Delivered:</span>
            <span class="status-value">17 September 2026, 8:18am</span>
          </div>
        </div>

        <div class="progress-wrap">
          <div class="progress-track" aria-label="Survey progress">
            <div class="progress-bar" :style="{ width: `${progress}%` }" />
            <span class="progress-marker" :style="{ left: `calc(${progress}% - 7px)` }" aria-hidden="true" />
          </div>
        </div>

        <section class="question-panel">
          <h1>{{ currentQuestion.text }}</h1>

          <div v-if="currentQuestion.type === 'rating'" class="answer-group rating-group" role="radiogroup" :aria-label="currentQuestion.text">
            <button
              v-for="star in starOptions"
              :key="star"
              type="button"
              class="star-button"
              :class="{ active: Number(answers[currentQuestion.id] ?? 0) >= star }"
              :aria-label="`Rate ${star} out of 5`"
              @click="setAnswer(star)"
            >
              <span aria-hidden="true">★</span>
            </button>
          </div>

          <div v-else-if="currentQuestion.type === 'shareExperience'" class="share-experience-layout">
            <div class="review-summary">
              <h2>Quick review</h2>
              <ul>
                <li v-for="entry in reviewEntries" :key="entry.id">
                  <span>{{ entry.label }}</span>
                  <strong>{{ entry.value }}</strong>
                </li>
              </ul>
            </div>

            <div class="upload-box">
              <label class="upload-label" for="product-photo">Upload a picture of your product</label>
              <label class="upload-button" for="product-photo">
                <input id="product-photo" type="file" accept="image/*" @change="handleImageUpload" />
                <span>{{ uploadedImage ? 'Change photo' : 'Add photo' }}</span>
              </label>

              <div v-if="uploadedImage" class="image-preview">
                <img :src="uploadedImage" alt="Uploaded product preview" />
              </div>
              <p v-if="productPhotoName" class="upload-filename">{{ productPhotoName }}</p>
            </div>

            <div class="ai-summary-box">
              <h3>AI summary</h3>
              <p>{{ aiSummary }}</p>
            </div>

            <label class="comment-label" :for="`comment-${currentQuestion.id}`">Optional personal review</label>
            <textarea
              :id="`comment-${currentQuestion.id}`"
              v-model="comments[currentQuestion.id]"
              placeholder="Add your own review to help future shoppers"
              rows="4"
            />
          </div>

          <div v-else class="answer-group selector-group" role="radiogroup" :aria-label="currentQuestion.text">
            <label
              class="selector-option"
              :class="{ selected: answers[currentQuestion.id] === 'yes' }"
            >
              <span class="selector-content">
                <input
                  class="radio-input"
                  type="radio"
                  :name="currentQuestion.id"
                  value="yes"
                  :checked="answers[currentQuestion.id] === 'yes'"
                  @change="setAnswer('yes')"
                />
                <span class="selector-label">Yes</span>
              </span>
            </label>
            <label
              class="selector-option"
              :class="{ selected: answers[currentQuestion.id] === 'no' }"
            >
              <span class="selector-content">
                <input
                  class="radio-input"
                  type="radio"
                  :name="currentQuestion.id"
                  value="no"
                  :checked="answers[currentQuestion.id] === 'no'"
                  @change="setAnswer('no')"
                />
                <span class="selector-label">No</span>
              </span>
            </label>
          </div>

          <template v-if="currentQuestion.type !== 'shareExperience' && answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== null">
            <label class="comment-label" :for="`comment-${currentQuestion.id}`">Optional comment</label>
            <textarea
              :id="`comment-${currentQuestion.id}`"
              v-model="comments[currentQuestion.id]"
              :placeholder="currentQuestion.placeholder"
              rows="4"
            />
          </template>
        </section>

        <div class="footer-actions">
          <button v-if="currentIndex > 0" class="secondary-btn" @click="back">Back</button>
          <button
            v-if="!isLastStep"
            class="primary-btn"
            :class="{ full: currentIndex === 0 }"
            :disabled="!answers[currentQuestion.id]"
            @click="next"
          >
            Next
          </button>
          <button
            v-else
            class="primary-btn"
            :disabled="!allRequiredAnswered"
            @click="shareFeedback"
          >
            Share
          </button>
        </div>
      </main>

      </div>
    </div>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background: #f5f4f3;
}

* {
  box-sizing: border-box;
}

button,
textarea {
  font: inherit;
}

.page-shell {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 32px 40px;
  overflow: hidden;
}

.app-shell {
  width: min(100%, 480px);
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px 18px;
  background: #ffffff;
  border-radius: 0;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(2px);
  margin-bottom: 24px;
}

.nav-icon {
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.menu-icon {
  width: 36px;
  height: 36px;
  flex-direction: column;
  gap: 4px;
}

.menu-icon span {
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: #111827;
  display: block;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-weight: 700;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f8ff7, #2563eb);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
}

.brand-text {
  font-size: 1.05rem;
  letter-spacing: -0.04em;
}

.avatar-icon {
  width: 36px;
  height: 36px;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  color: #111827;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  aspect-ratio: 1;
}

.phone-frame {
  width: min(100%, 393px);
  height: min(852px, calc(100vh - 72px));
  min-height: 0;
  background: #f7f7f7;
  border-radius: 36px;
  padding: 0;
  overflow-y: auto;
  box-shadow: 0 18px 34px rgba(17, 24, 39, 0.08);
}

.survey-card {
  background: #ffffff;
  border-radius: 26px;
  margin: 0 24px;
  padding: 24px 24px 18px;
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.05);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.icon-button {
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  font-size: 2rem;
  line-height: 1;
  color: #111827;
  cursor: pointer;
}

.product-header-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 18px;
  background: #e5e7eb;
  margin-bottom: 12px;
}

.product-header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-meta {
  text-align: center;
  margin-bottom: 18px;
}

.product-meta h2 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.3;
  color: #111827;
}

.product-meta p {
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: #4b5563;
  line-height: 1.4;
}

.delivery-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.72rem;
  line-height: 1.5;
  color: #374151;
  letter-spacing: -0.01em;
}

.status-label {
  font-weight: 700;
  color: #111827;
}

.status-value {
  color: #4b5563;
}

.progress-wrap {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.progress-track {
  position: relative;
  height: 1px;
  border-radius: 0;
  background: #D1D1D1;
  overflow: hidden;
}

.progress-bar {
  display: none;
}

.progress-marker {
  display: none;
}

.stepper {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 8px;
  align-items: center;
}

.step-node {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e5e7eb;
  color: #9ca3af;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.step-node.complete,
.step-node.active {
  background: #dbeafe;
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.2);
}

.step-node.active {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.09);
}


.question-panel {
  padding: 8px 2px 18px;
}

.question-panel h1 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.2;
  color: #111827;
}

.answer-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.selector-group {
  display: flex;
  gap: 24px;
  margin: 8px 0 18px;
  max-width: 100%;
}

.selector-option {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border: none;
  background: transparent;
  color: #111827;
  padding: 4px 0;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.selector-content {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
}

.radio-input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #2563eb;
}

.selector-label {
  letter-spacing: -0.02em;
  line-height: 1;
}

.selector-option.selected {
  color: #2563eb;
}

.rating-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  grid-template-columns: none;
  margin: 10px 0 26px;
}

.star-button {
  width: 52px;
  height: 52px;
  border: none;
  background: transparent;
  color: #d1d5db;
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: transform 0.18s ease, color 0.18s ease;
}

.star-button:hover {
  transform: translateY(-2px);
}

.star-button.active {
  color: #fbbf24;
  text-shadow: 0 0 16px rgba(251, 191, 36, 0.35);
}

.share-experience-layout {
  display: grid;
  gap: 16px;
  margin-top: 12px;
}

.review-summary,
.upload-box,
.ai-summary-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 16px;
}

.review-summary h2,
.ai-summary-box h3 {
  margin: 0 0 10px;
  font-size: 1rem;
  color: #111827;
}

.review-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.review-summary li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.82rem;
  color: #374151;
  line-height: 1.4;
}

.review-summary li strong {
  color: #111827;
  font-size: 0.78rem;
  text-align: right;
}

.upload-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 1px dashed #94a3b8;
  border-radius: 12px;
  background: white;
  padding: 12px 14px;
  cursor: pointer;
  color: #1f2937;
  font-weight: 600;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-button:hover {
  background: #f3f4f6;
  border-color: #64748b;
}

.upload-button input {
  display: none;
}

.image-preview {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  background: #e5e7eb;
}

.image-preview img {
  display: block;
  width: 100%;
  max-height: 170px;
  object-fit: cover;
}

.upload-filename {
  margin: 10px 0 0;
  font-size: 0.8rem;
  color: #4b5563;
}

.ai-summary-box p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
  font-size: 0.84rem;
}

.comment-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  resize: vertical;
  min-height: 90px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  padding: 12px 14px;
  color: #111827;
  font-size: 14px;
  font-style: italic;
}

textarea:focus {
  outline: 2px solid rgba(37, 99, 235, 0.25);
  border-color: #2563eb;
}

.footer-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  align-items: center;
}

.secondary-btn,
.primary-btn {
  border-radius: 14px;
  border: none;
  padding: 14px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.secondary-btn {
  flex: 0.9;
  background: #f3f4f6;
  color: #111827;
}

.primary-btn {
  flex: 1.5;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.primary-btn.full {
  flex: 1;
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.summary-panel {
  margin-top: 18px;
  background: rgba(17, 24, 39, 0.02);
  border-radius: 20px;
  padding: 14px 12px;
  color: #374151;
}

.summary-header {
  font-weight: 700;
  margin-bottom: 10px;
  color: #111827;
}

.summary-panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.summary-panel li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  opacity: 0.9;
}

.summary-panel li.current {
  opacity: 1;
  font-weight: 600;
  color: #111827;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4b5563;
  display: inline-block;
}

.summary-panel li.complete .dot {
  background: #16a34a;
}

.summary-panel li.current .dot {
  background: #16a34a;
}

.mini-review {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(17, 24, 39, 0.12);
}

.mini-review h2 {
  margin: 0 0 8px;
  font-size: 1rem;
  color: #111827;
}

.mini-review p {
  margin: 0 0 6px;
  color: #374151;
  font-size: 0.82rem;
  line-height: 1.45;
}

@media (min-width: 700px) {
  .phone-frame {
    width: min(100%, 393px);
  }
}
</style>
