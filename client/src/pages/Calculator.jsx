import { useState } from 'react';

const Calculator = () => {
  const [calcType, setCalcType] = useState('sgpa'); // 'sgpa' or 'cgpa'
  const [subjects, setSubjects] = useState([
    { name: '', credits: '', grade: '' }
  ]);
  const [semesters, setSemesters] = useState([
    { semester: 1, sgpa: '', credits: '' }
  ]);
  const [result, setResult] = useState(null);

  const gradePoints = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', credits: '', grade: '' }]);
  };

  const addSemester = () => {
    setSemesters([...semesters, { semester: semesters.length + 1, sgpa: '', credits: '' }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const removeSemester = (index) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const updateSemester = (index, field, value) => {
    const updated = [...semesters];
    updated[index][field] = value;
    setSemesters(updated);
  };

  const calculateSGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const subject of subjects) {
      if (subject.credits && subject.grade) {
        const credits = parseFloat(subject.credits);
        const points = gradePoints[subject.grade];
        totalPoints += credits * points;
        totalCredits += credits;
      }
    }

    if (totalCredits === 0) {
      setResult({ error: 'Please enter valid credits and grades' });
      return;
    }

    const sgpa = (totalPoints / totalCredits).toFixed(2);
    setResult({ sgpa, totalCredits });
  };

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const sem of semesters) {
      if (sem.sgpa && sem.credits) {
        const sgpa = parseFloat(sem.sgpa);
        const credits = parseFloat(sem.credits);
        totalPoints += sgpa * credits;
        totalCredits += credits;
      }
    }

    if (totalCredits === 0) {
      setResult({ error: 'Please enter valid SGPA and credits for each semester' });
      return;
    }

    const cgpa = (totalPoints / totalCredits).toFixed(2);
    setResult({ cgpa, semesters: semesters.length, totalCredits });
  };

  const resetCalculator = () => {
    if (calcType === 'sgpa') {
      setSubjects([{ name: '', credits: '', grade: '' }]);
    } else {
      setSemesters([{ semester: 1, sgpa: '', credits: '' }]);
    }
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">VTU Calculator</h1>
        <p className="text-xs sm:text-sm text-slate-400">Calculate your SGPA & CGPA easily</p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => { setCalcType('sgpa'); setResult(null); }}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            calcType === 'sgpa'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}>
          SGPA Calculator
        </button>
        <button
          onClick={() => { setCalcType('cgpa'); setResult(null); }}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            calcType === 'cgpa'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}>
          CGPA Calculator
        </button>
      </div>

      {/* Grade Reference Card */}
      <div className="rounded-2xl p-4 sm:p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
        <h3 className="text-sm font-semibold text-white mb-3">VTU Grade Points:</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-xs">
          {Object.entries(gradePoints).map(([grade, points]) => (
            <div key={grade} className="text-center">
              <div className="font-bold text-indigo-400">{grade}</div>
              <div className="text-slate-500">{points}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculator Forms */}
      {calcType === 'sgpa' ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Enter Subject Details:</h2>
          
          {subjects.map((subject, index) => (
            <div key={index} className="rounded-xl p-4 space-y-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Subject {index + 1}</span>
                {subjects.length > 1 && (
                  <button
                    onClick={() => removeSubject(index)}
                    className="text-red-400 hover:text-red-300 text-xs">
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Subject Name (optional)"
                  value={subject.name}
                  onChange={(e) => updateSubject(index, 'name', e.target.value)}
                  className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={subject.credits}
                  onChange={(e) => updateSubject(index, 'credits', e.target.value)}
                  className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  min="0"
                  step="0.5"
                />
                <select
                  value={subject.grade}
                  onChange={(e) => updateSubject(index, 'grade', e.target.value)}
                  className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500">
                  <option value="">Select Grade</option>
                  {Object.keys(gradePoints).map(grade => (
                    <option key={grade} value={grade}>{grade} ({gradePoints[grade]})</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={addSubject}
            className="w-full py-3 rounded-xl text-sm font-medium text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 transition-all">
            + Add Subject
          </button>

          <div className="flex gap-3">
            <button
              onClick={calculateSGPA}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
              Calculate SGPA
            </button>
            <button
              onClick={resetCalculator}
              className="px-6 py-3 rounded-xl font-semibold text-slate-400 bg-slate-800/50 hover:bg-slate-800 transition-all">
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Enter Semester Details:</h2>
          
          {semesters.map((sem, index) => (
            <div key={index} className="rounded-xl p-4 space-y-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">Semester {sem.semester}</span>
                {semesters.length > 1 && (
                  <button
                    onClick={() => removeSemester(index)}
                    className="text-red-400 hover:text-red-300 text-xs">
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="SGPA (e.g., 8.5)"
                  value={sem.sgpa}
                  onChange={(e) => updateSemester(index, 'sgpa', e.target.value)}
                  className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  min="0"
                  max="10"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Total Credits"
                  value={sem.credits}
                  onChange={(e) => updateSemester(index, 'credits', e.target.value)}
                  className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addSemester}
            className="w-full py-3 rounded-xl text-sm font-medium text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 transition-all">
            + Add Semester
          </button>

          <div className="flex gap-3">
            <button
              onClick={calculateCGPA}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
              Calculate CGPA
            </button>
            <button
              onClick={resetCalculator}
              className="px-6 py-3 rounded-xl font-semibold text-slate-400 bg-slate-800/50 hover:bg-slate-800 transition-all">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="rounded-2xl p-6 text-center space-y-3"
          style={{
            background: result.error 
              ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))'
              : 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.1))',
            border: result.error
              ? '1px solid rgba(239,68,68,0.3)'
              : '1px solid rgba(34,197,94,0.3)',
          }}>
          {result.error ? (
            <p className="text-red-400 font-medium">{result.error}</p>
          ) : (
            <>
              <h3 className="text-sm text-slate-400">Your {calcType.toUpperCase()}</h3>
              <div className="text-5xl font-bold text-white">
                {calcType === 'sgpa' ? result.sgpa : result.cgpa}
              </div>
              <p className="text-sm text-slate-400">
                Total Credits: {result.totalCredits}
                {calcType === 'cgpa' && ` • Semesters: ${result.semesters}`}
              </p>
              <div className="text-xs text-slate-500 pt-2">
                {(calcType === 'sgpa' ? parseFloat(result.sgpa) : parseFloat(result.cgpa)) >= 9.0 ? '🏆 Outstanding!' :
                (calcType === 'sgpa' ? parseFloat(result.sgpa) : parseFloat(result.cgpa)) >= 8.0 ? '🌟 Excellent!' :
                (calcType === 'sgpa' ? parseFloat(result.sgpa) : parseFloat(result.cgpa)) >= 7.0 ? '✨ Very Good!' :
                (calcType === 'sgpa' ? parseFloat(result.sgpa) : parseFloat(result.cgpa)) >= 6.0 ? '👍 Good!' : '💪 Keep Going!'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Calculator;
