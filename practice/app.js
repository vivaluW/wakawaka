// 创建一个简单的状态管理
class Store {
  constructor() {
    this.grammarPoints = {};
    this.currentQuestion = null;
    this.mode = 'jp-to-cn';
    this.userAnswer = '';
    this.feedback = null;
  }
}

// React 组件
const GrammarPractice = () => {
  const [state, setState] = React.useState(new Store());
  
  // 加载语法数据
  React.useEffect(() => {
    fetch('/wakawaka/grammar-points.json')
      .then(response => response.json())
      .then(data => {
        setState(prev => ({ ...prev, grammarPoints: data }));
      })
      .catch(error => console.error('Error loading grammar points:', error));
  }, []);

  // 生成新的练习
  const generateQuestion = () => {
    const { grammarPoints } = state;
    if (Object.keys(grammarPoints).length === 0) return;

    const grammarKeys = Object.keys(grammarPoints);
    const randomGrammar = grammarKeys[Math.floor(Math.random() * grammarKeys.length)];
    const patterns = grammarPoints[randomGrammar].patterns;
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];

    setState(prev => ({
      ...prev,
      currentQuestion: { ...randomPattern, grammar: randomGrammar },
      userAnswer: '',
      feedback: null
    }));
  };

  // 检查答案
  const checkAnswer = () => {
    const { currentQuestion, userAnswer, mode } = state;
    if (!currentQuestion || !userAnswer) return;

    const correctAnswer = mode === 'jp-to-cn' 
      ? currentQuestion.chinese 
      : currentQuestion.japanese;

    let feedbackDetails = [];
    let isCorrect = false;

    if (mode === 'jp-to-cn') {
      const userKeywords = userAnswer.replace(/[，。、]/g, '');
      const correctKeywords = correctAnswer.replace(/[，。、]/g, '');
      isCorrect = userKeywords === correctKeywords;

      if (!isCorrect) {
        feedbackDetails.push('试着更准确地表达原文的含义');
      }
    } else {
      const userNormalized = userAnswer.replace(/[\s、。]/g, '');
      const correctNormalized = correctAnswer.replace(/[\s、。]/g, '');
      isCorrect = userNormalized === correctNormalized;

      if (!isCorrect) {
        feedbackDetails.push(`要注意"${currentQuestion.grammar}"的正确用法`);
      }
    }

    setState(prev => ({
      ...prev,
      feedback: {
        isCorrect,
        details: feedbackDetails,
        correctAnswer
      }
    }));
  };

  return React.createElement('div', { className: 'container mx-auto p-4' },
    // 标题
    React.createElement('h1', { className: 'text-2xl font-bold text-center mb-6' },
      '日语语法练习生成器'
    ),

    // 模式切换
    React.createElement('div', { className: 'flex justify-center gap-4 mb-6' },
      React.createElement('button', {
        className: `px-4 py-2 rounded ${state.mode === 'jp-to-cn' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setState(prev => ({ ...prev, mode: 'jp-to-cn' }))
      }, '日译中'),
      React.createElement('button', {
        className: `px-4 py-2 rounded ${state.mode === 'cn-to-jp' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
        onClick: () => setState(prev => ({ ...prev, mode: 'cn-to-jp' }))
      }, '中译日')
    ),

    // 生成按钮
    React.createElement('button', {
      className: 'w-full bg-green-500 text-white py-2 rounded mb-6',
      onClick: generateQuestion
    }, '生成新练习'),

    // 练习区域
    state.currentQuestion && React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'p-4 bg-gray-50 rounded' },
        React.createElement('h3', { className: 'font-bold mb-2' },
          state.mode === 'jp-to-cn' ? '请将以下日语翻译成中文：' : '请将以下中文翻译成日语：'
        ),
        React.createElement('p', { className: 'text-lg' },
          state.mode === 'jp-to-cn' ? state.currentQuestion.japanese : state.currentQuestion.chinese
        )
      ),

      // 输入区
      React.createElement('input', {
        type: 'text',
        className: 'w-full p-2 border rounded',
        value: state.userAnswer,
        onChange: (e) => setState(prev => ({ ...prev, userAnswer: e.target.value })),
        placeholder: state.mode === 'jp-to-cn' ? '请输入中文翻译' : '请输入日语翻译'
      }),

      // 检查按钮
      React.createElement('button', {
        className: 'w-full bg-blue-500 text-white py-2 rounded',
        onClick: checkAnswer
      }, '检查答案'),

      // 反馈区域
      state.feedback && React.createElement('div', {
        className: `p-4 rounded ${state.feedback.isCorrect ? 'bg-green-50' : 'bg-yellow-50'}`
      },
        React.createElement('h4', { className: 'font-bold mb-2' },
          state.feedback.isCorrect ? '回答正确！' : '还需改进'
        ),
        state.feedback.details.length > 0 && React.createElement('ul', { className: 'list-disc pl-4 mb-2' },
          state.feedback.details.map((detail, idx) =>
            React.createElement('li', { key: idx }, detail)
          )
        ),
        React.createElement('p', null, '正确答案：', state.feedback.correctAnswer)
      )
    )
  );
};

// 渲染应用
ReactDOM.render(
  React.createElement(GrammarPractice),
  document.getElementById('root')
);