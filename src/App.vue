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

      <div class="phone-frame">
        <div class="status-bar">
          <span>9:41</span>
          <div class="status-icons">
            <span class="signal" />
            <span class="wifi" />
            <span class="battery" />
          </div>
        </div>

        <main class="survey-card">
        <header class="header-row">
          <button v-if="currentIndex > 0" class="icon-button" @click="back" aria-label="Back">
            ‹
          </button>
          <div class="header-title">{{ metrics.survey.title }}</div>
          <div class="header-space" />
        </header>

        <div class="progress-track">
          <div class="progress-bar" :style="{ width: `${progress}%` }" />
        </div>

        <section class="question-panel">
          <p class="eyebrow">Delivery update</p>
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

          <div v-else class="answer-group selector-group">
            <button
              class="selector-option"
              :class="{ selected: answers[currentQuestion.id] === 'yes' }"
              @click="setAnswer('yes')"
            >
              <span class="selector-content">
                <span class="selector-icon success" :class="{ active: answers[currentQuestion.id] === 'yes' }">
                  ✓
                </span>
                <span class="selector-label">Yes</span>
              </span>
            </button>
            <button
              class="selector-option"
              :class="{ selected: answers[currentQuestion.id] === 'no' }"
              @click="setAnswer('no')"
            >
              <span class="selector-content">
                <span class="selector-icon danger" :class="{ active: answers[currentQuestion.id] === 'no' }">
                  ✕
                </span>
                <span class="selector-label">No</span>
              </span>
            </button>
          </div>

          <template v-if="currentQuestion.type !== 'shareExperience'">
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
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
  border-radius: 18px 18px 0 0;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(2px);
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
  width: min(100%, 430px);
  background: #f7f7f7;
  border-radius: 0 0 36px 36px;
  padding: 18px 18px 14px;
  box-shadow: 0 18px 34px rgba(17, 24, 39, 0.08);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #111827;
  padding: 4px 8px 12px;
  font-size: 0.95rem;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.signal,
.wifi,
.battery {
  display: inline-block;
  background: #111827;
  border-radius: 999px;
}

.signal {
  width: 18px;
  height: 10px;
  clip-path: polygon(0 100%, 20% 100%, 20% 60%, 40% 60%, 40% 30%, 60% 30%, 60% 10%, 80% 10%, 80% 0, 100% 0, 100% 100%);
}

.wifi {
  width: 12px;
  height: 12px;
  border: 2px solid #111827;
  border-color: #111827 transparent transparent transparent;
  border-radius: 50%;
  transform: rotate(180deg);
}

.battery {
  width: 22px;
  height: 12px;
  position: relative;
  border: 2px solid #111827;
  background: transparent;
}

.battery::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 3px;
  width: 2px;
  height: 4px;
  background: #111827;
  border-radius: 1px;
}

.survey-card {
  background: #ffffff;
  border-radius: 26px;
  padding: 16px 18px 18px;
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

.header-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 1.15rem;
  color: #111827;
}

.header-space {
  width: 38px;
}

.progress-track {
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
  margin-bottom: 18px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #2563eb);
  border-radius: inherit;
}

.question-panel {
  padding: 8px 2px 18px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}

.question-panel h1 {
  margin: 0 0 18px;
  font-size: clamp(1.7rem, 4vw, 2.2rem);
  line-height: 1.12;
  color: #111827;
}

.answer-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.selector-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 8px 0 22px;
  max-width: 100%;
}

.selector-option {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #111827;
  border-radius: 22px;
  padding: 14px 16px;
  font-weight: 700;
  font-size: clamp(1rem, 2.2vw, 1.5rem);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selector-option.selected {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.18);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08);
}

.selector-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
}

.selector-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.45rem;
  font-weight: 800;
  background: rgba(17, 24, 39, 0.08);
  color: #111827;
  line-height: 1;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.selector-icon.success {
  color: #111827;
}

.selector-icon.danger {
  color: #111827;
}

.selector-option.selected .selector-icon {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.selector-label {
  letter-spacing: -0.02em;
  line-height: 1;
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
    width: min(100%, 480px);
  }
}
</style>
