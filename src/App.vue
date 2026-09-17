<script setup lang="ts">
import { computed, ref } from 'vue'
import metrics from './data/metrics.json'

const questions = metrics.survey.questions
const currentIndex = ref(0)
const answers = ref<Record<string, 'yes' | 'no' | null>>({})
const comments = ref<Record<string, string>>({})

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastStep = computed(() => currentIndex.value === questions.length - 1)
const progress = computed(() => ((currentIndex.value + 1) / questions.length) * 100)

const setAnswer = (value: 'yes' | 'no') => {
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

const shareFeedback = () => {
  const message = encodeURIComponent(metrics.messaging.shareText)
  window.location.href = `sms:?&body=${message}`
}

const getAnswerLabel = (value: 'yes' | 'no' | null) => {
  if (!value) return 'Not answered'
  return value === 'yes' ? 'Yes' : 'No'
}
</script>

<template>
  <div class="page-shell">
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

          <div class="answer-group">
            <button
              class="answer-button"
              :class="{ selected: answers[currentQuestion.id] === 'yes' }"
              @click="setAnswer('yes')"
            >
              Yes
            </button>
            <button
              class="answer-button"
              :class="{ selected: answers[currentQuestion.id] === 'no' }"
              @click="setAnswer('no')"
            >
              No
            </button>
          </div>

          <label class="comment-label" :for="`comment-${currentQuestion.id}`">Optional comment</label>
          <textarea
            :id="`comment-${currentQuestion.id}`"
            v-model="comments[currentQuestion.id]"
            :placeholder="currentQuestion.placeholder"
            rows="4"
          />
        </section>

        <div class="footer-actions">
          <button class="secondary-btn" :disabled="currentIndex === 0" @click="back">Back</button>
          <button
            v-if="!isLastStep"
            class="primary-btn"
            :disabled="!answers[currentQuestion.id]"
            @click="next"
          >
            Next
          </button>
          <button v-else class="primary-btn" :disabled="!answers[currentQuestion.id]" @click="shareFeedback">
            Share
          </button>
        </div>
      </main>

      <aside class="summary-panel" aria-live="polite">
        <div class="summary-header">Delivery status</div>
        <ul>
          <li v-for="step in metrics.deliveryStatus.steps" :key="step.label" :class="step.state">
            <span class="dot" />
            <span>{{ step.label }}</span>
          </li>
        </ul>

        <div class="mini-review">
          <h2>Quick review</h2>
          <p v-for="question in questions" :key="question.id">
            {{ question.text }} — {{ getAnswerLabel(answers[question.id] ?? null) }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background: linear-gradient(135deg, #1d4ed8, #2563eb 55%, #1e40af);
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

.phone-frame {
  width: min(100%, 430px);
  background: #f7f7f7;
  border-radius: 36px;
  padding: 18px 18px 14px;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.25);
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
  background: linear-gradient(90deg, #4f46e5, #2563eb);
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

.answer-button {
  border: 1px solid #d1d5db;
  background: #f3f4f6;
  color: #111827;
  border-radius: 16px;
  padding: 14px 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-button.selected {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
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
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.summary-panel {
  margin-top: 18px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 14px 12px;
  color: #dbeafe;
}

.summary-header {
  font-weight: 700;
  margin-bottom: 10px;
  color: #eff6ff;
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
  color: #dbeafe;
  opacity: 0.8;
}

.summary-panel li.current {
  opacity: 1;
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #93c5fd;
  display: inline-block;
}

.summary-panel li.complete .dot {
  background: #34d399;
}

.summary-panel li.current .dot {
  background: #fbbf24;
}

.mini-review {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.mini-review h2 {
  margin: 0 0 8px;
  font-size: 1rem;
  color: #eff6ff;
}

.mini-review p {
  margin: 0 0 6px;
  color: #dbeafe;
  font-size: 0.82rem;
  line-height: 1.45;
}

@media (min-width: 700px) {
  .phone-frame {
    width: min(100%, 480px);
  }
}
</style>
