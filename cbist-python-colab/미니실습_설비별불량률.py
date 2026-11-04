# VS Code 미니 실습 : 설비별 불량률 · 평균 온도 그래프
# 준비 : 이 파일과 '라인_센서로그_가상데이터.csv'를 같은 폴더에 두기
# 실행 : VS Code 터미널에서  python 미니실습_설비별불량률.py   (안 되면  py 미니실습_설비별불량률.py)

import pandas as pd
import matplotlib.pyplot as plt

plt.rcParams['font.family'] = 'Malgun Gothic'   # 윈도우 한글 폰트 (Colab의 【준비】 셀 역할)
plt.rcParams['axes.unicode_minus'] = False

센서 = pd.read_csv('라인_센서로그_가상데이터.csv')
print('데이터 크기 :', 센서.shape)                       # (2400, 6)

불량률 = 센서.groupby('설비 ID')['불량여부'].mean() * 100   # 설비별 불량률(%)
평균온도 = 센서.groupby('설비 ID')['온도'].mean()          # 설비별 평균 온도
print('\n설비별 불량률(%)\n', 불량률.round(1))

fig, ax = plt.subplots(1, 2, figsize=(12, 4.5))
for a, 값, 제목, 단위 in [(ax[0], 불량률, '설비별 불량률', '불량률 (%)'), (ax[1], 평균온도, '설비별 평균 온도', '온도 (℃)')]:
    색 = ['#C92A2A' if i == 불량률.idxmax() else '#ADB5BD' for i in 값.index]
    막대 = a.bar(값.index, 값.values, color=색)
    for b, v in zip(막대, 값.values):
        a.text(b.get_x() + b.get_width() / 2, v, f'{v:.1f}', ha='center', va='bottom')
    a.set_title(제목); a.set_xlabel('설비 ID'); a.set_ylabel(단위)
plt.tight_layout()
plt.savefig('설비별_불량률.png', dpi=150)                 # 같은 폴더에 그림 파일로 저장
print('\n설비별_불량률.png 저장 완료')
plt.show()                                               # 그래프 창 띄우기
