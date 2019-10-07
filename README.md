# secret-test

## Launch
`yarn && yarn start` or `npm install && npm start`
  
## With React?
По-хорошему `Scene`, `Line`, `Label` обернуть в компоненты с примерно таким api
```jsx
<Scene width={1200} height={250} transform={chartMatrix}>
    <Line points={axisPoints}>
    <Line points={dataPoints} color="green">
</Scene>
<Scene width={1200} height={100}  transform={timeMatrix}>
    {labels.map(label => (
        <Label key={label.text} x={label.x} y={label.y}>{label.text}</Label>
    ))}
</Scene>
```

## Also
Не стал делать проверки на наличие данных и нештатных ситуаций т.к. это за пределами задачи
