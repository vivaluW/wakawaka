class Store {
  constructor() {
    this.grammarData = { structure: {}, points: {} };
    this.currentQuestion = null;
    this.mode = 'jp-to-cn';
    this.selectedCategory = 'all';
    this.userAnswer = '';
    this.feedback = null;
  }
}

const GrammarPractice = () => {
  const [state, setState] = React.useState(new Store());
  
  React.useEffect(() => {
    fetch('/wakawaka/grammar-points.json')
      .then(response => response.json())
      .then(data => setState(prev => ({ ...prev, grammarData: data })))
      .catch(error => console.error('Error:', error));
  }, []);

  const generateQuestion = () => {
    const { grammarData, selectedCategory } = state;
    const availablePoints = Object.entries(grammarData.points)
      .filter(([key, value]) => 
        selectedCategory === 'all' || value.category === selectedCategory
      );

    if (availablePoints.length === 0) return;

    const [grammarName, grammarPoint] = availablePoints[
      Math.floor(Math.random() * availablePoints.length)
    ];
    const pattern = grammarPoint.patterns[
      Math.floor(Math.random() * grammarPoint.patterns.length)
    ];

    setState(prev => ({
      ...prev,
      currentQuestion: { ...pattern, grammar: grammarName },
      userAnswer: '',
      feedback: null
    }));
  };

  const checkAnswer = () => {
    const { currentQuestion, userAnswer, mode } = state;
    if (!currentQuestion || !userAnswer) return;

    const correctAnswer = mode === 'jp-to-cn' 
      ? currentQuestion.chinese 
      : currentQuestion.japanese;

    const feedbackDetails = [];
    const isCorrect = mode === 'jp-to-cn'
      ? userAnswer.replace(/[，。、]/g, '') === correctAnswer.replace(/[，。、]/g, '')
      : userAnswer.replace(/[\s、。]/g, '') === correctAnswer.replace(/[\s、。]/g, '');

    if (!isCorrect) {
      feedbackDetails.push(mode === 'jp-to-cn'
        ? '试着更准确地表达原文的含义'
        : `要注意"${currentQuestion.grammar}"的正确用法`);
    }

    setState(prev => ({
      ...prev,
      feedback: { isCorrect, details: feedbackDetails, correctAnswer }
    }));
  };

  return React.createElement('div', { className: 'container mx-auto p-4' },
    React.createElement('h1', { className: 'text-2xl font-bold text-center mb-6' },
      '日语语法练习生成器'
    ),

    React.createElement('div', { className: 'flex flex-col gap-4 mb-6' },
      React.createElement('div', { className: 'flex justify-center gap-4' },
        React.createElement('button', {
          className: `px-4 py-2 rounded ${state.mode === 'jp-to-cn' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
          onClick: () => setState(prev => ({ ...prev, mode: 'jp-to-cn' }))
        }, '日译中'),
        React.createElement('button', {
          className: `px-4 py-2 rounded ${state.mode === 'cn-to-jp' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`,
          onClick: () => setState(prev => ({ ...prev, mode: 'cn-to-jp' }))
        }, '中译日')
      ),

      React.createElement('select', {
        className: 'w-full p-2 border rounded',
        value: state.selectedCategory,
        onChange: (e) => setState(prev => ({ ...prev, selectedCategory: e.target.value }))
      },
        React.createElement('option', { value: 'all' }, '所有语法点'),
        Object.keys(state.grammarData.structure).map(category =>
          React.createElement('option', { key: category, value: category }, category)
        )
      )
    ),

    React.createElement('button', {
      className: 'w-full bg-green-500 text-white py-2 rounded mb-6',
      onClick: generateQuestion
    }, '生成新练习'),

    state.currentQuestion && React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'p-4 bg-gray-50 rounded' },
        React.createElement('h3', { className: 'font-bold mb-2' },
          state.mode === 'jp-to-cn' ? '请将以下日语翻译成中文：' : '请将以下中文翻译成日语：'
        ),
        React.createElement('p', { className: 'text-lg' },
          state.mode === 'jp-to-cn' ? state.currentQuestion.japanese : state.currentQuestion.chinese
        ),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-2' },
          '语法点：', state.currentQuestion.grammar
        )
      ),

      React.createElement('input', {
        className: 'w-full p-2 border rounded',
        value: state.userAnswer,
        onChange: (e) => setState(prev => ({ ...prev, userAnswer: e.target.value })),
        placeholder: state.mode === 'jp-to-cn' ? '请输入中文翻译' : '请输入日语翻译'
      }),

      React.createElement('button', {
        className: 'w-full bg-blue-500 text-white py-2 rounded',
        onClick: checkAnswer
      }, '检查答案'),

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

ReactDOM.render(
  React.createElement(GrammarPractice),
  document.getElementById('root')
);