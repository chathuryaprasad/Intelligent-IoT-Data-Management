# IsolationForestDetector

Type: ML-based anomaly detector  
Library: scikit-learn  
Owner: Yashdeep Singh Vilkhu, Models Team  
Status: Complete

## What It Does

`IsolationForestDetector` detects anomalous multivariate sensor readings in IoT data.

Instead of learning a boundary around normal data like OCSVM, Isolation Forest works by checking how easily each data point can be isolated from the rest of the dataset. Points that are different from the majority usually require fewer splits to isolate, so they receive higher anomaly scores.

In the Intelligent IoT Data Management project, this makes Isolation Forest useful for detecting abnormal combinations of sensor values across multiple channels.

## Input / Output Format

### Input

Pandas DataFrame with numeric sensor columns.

Requirements:

- Rows represent time-ordered sensor readings
- Columns represent numeric sensor channels
- Index should align with the pipeline timestamp index
- Values should already be preprocessed and scaled by the pipeline where required
- Missing values should be handled before detection
- Non-numeric columns should be removed or encoded before detection

### Output

Dictionary following the standard Models team detector interface:

    {
        "anomaly_flag": pd.Series,
        "score": pd.Series,
        "model_name": "IsolationForest",
        "timestamp": df.index,
        "runtime": float
    }

`anomaly_flag` contains boolean predictions:

    True  = anomaly
    False = normal

`score` is based on the Isolation Forest decision function, flipped so that higher values mean more anomalous.

## How to Run

From inside `data_science/`:

    python pipeline.py datasets/complex.csv --benchmark

Train/test benchmark:

    python pipeline.py datasets/complex_clean.csv --benchmark --train-test

NAB benchmark:

    python pipeline.py "https://raw.githubusercontent.com/numenta/NAB/master/data/realKnownCause/machine_temperature_system_failure.csv" --benchmark --label-source nab --nab-label-file "https://raw.githubusercontent.com/numenta/NAB/master/labels/combined_windows.json" --nab-dataset-key "realKnownCause/machine_temperature_system_failure.csv"

Run all benchmark modes:

    python run_all_benchmarks.py

## Dependencies

Main dependency:

    scikit-learn

The wider benchmark pipeline also uses:

    pandas
    numpy
    matplotlib
    seaborn
    adtk
    pyod

Install project dependencies from inside `data_science/`:

    pip install -r requirements.txt

## Files in This Folder

Main detector file:

    data_science/detectors/isolation_forest_detector.py

Related files:

    data_science/pipeline.py
    data_science/evaluator.py
    data_science/report_output.py
    data_science/roc_plotter.py

## Current Implementation

The detector should be registered in `pipeline.py` through `build_detectors()`:

    IsolationForestDetector(n_estimators=100, contamination=0.05)

Expected implementation flow:

1. Receive the preprocessed numeric DataFrame from the pipeline.
2. Fit an `IsolationForest` model on the input data or training split.
3. Generate anomaly predictions.
4. Convert predictions into boolean anomaly flags.
5. Generate anomaly scores where higher values mean more anomalous.
6. Return the standard detector dictionary used by the evaluator and report system.

## Key Hyperparameters

### `n_estimators=100`

The number of trees in the Isolation Forest ensemble.

A larger number of trees can make scores more stable, but also increases runtime. The current value provides a reasonable balance between stability and speed.

### `contamination=0.05`

Expected proportion of anomalies in the dataset.

This controls the decision threshold used to classify points as anomalous. Increasing contamination makes the detector more sensitive, while decreasing it makes the detector more conservative.

### `max_samples="auto"`

Number of samples used to train each tree.

The `auto` setting follows the scikit-learn default behaviour and is efficient for larger datasets.

## Benchmark Snapshot

Based on the supplied IsolationForest documentation:

### Synthetic benchmark

| Metric | Value |
|---|---:|
| Precision | 0.6833 |
| Recall | 0.5395 |
| F1 Score | 0.6029 |
| AUC-ROC | 0.8014 |
| False Positive Rate | 0.0169 |
| Predicted Anomalies | 57 |
| Actual Anomalies | 76 |

### Train/test benchmark

| Metric | Value |
|---|---:|
| Precision | 0.5161 |
| Recall | 0.9718 |
| F1 Score | 0.6737 |
| AUC-ROC | 0.9718 |
| False Positive Rate | 0.2838 |
| Predicted Anomalies | 137 |
| Actual Anomalies | 71 |

### NAB benchmark

| Metric | Value |
|---|---:|
| Precision | 0.3529 |
| Recall | 0.1058 |
| F1 Score | 0.1628 |
| AUC-ROC | 0.6212 |
| False Positive Rate | 0.0215 |
| Predicted Anomalies | 843 |
| Actual Anomalies | 2268 |

## Interpretation

`IsolationForestDetector` performed strongly in the controlled benchmark settings.

In the synthetic benchmark, it achieved a good balance between precision and recall, showing that it can detect injected anomalies while keeping false positives relatively low.

In the train/test benchmark, it achieved very high recall and a strong F1 score, catching 69 out of 71 injected anomalies. The trade-off is that it also produced a higher number of false positives, so it is sensitive and may need threshold or contamination tuning before being used for final user-facing alerts.

In the NAB benchmark, performance was weaker. This is partly because the current NAB evaluation uses pointwise precision and recall against wide anomaly windows, rather than the official NAB scoring profile. Isolation Forest may detect only the sharpest abnormal parts of an anomaly window, which lowers pointwise recall.

## Comparison to Other Detectors

Isolation Forest is one of the strongest detectors in the controlled benchmark modes.

Compared with OCSVM:

- it is generally faster
- it does not need a kernel function
- it does not store support vectors
- it performed slightly better than OCSVM on synthetic F1 in the supplied documentation
- it performed similarly strongly to OCSVM in train/test evaluation

Compared with rule-based or distribution-based detectors:

- it is less directly interpretable
- it can capture multivariate patterns more naturally
- it may produce more false positives if contamination is not tuned

It is best used alongside other detectors rather than as the only alerting model.

## Known Limitations

- Sensitive to the `contamination` parameter.
- Can produce false positives if the threshold is too sensitive.
- Less interpretable than rule-based detectors because it does not directly explain which feature caused the anomaly.
- Assumes training data is mostly normal.
- Performance can degrade under major distribution shift.
- NAB pointwise metrics may understate performance because NAB labels are wide anomaly windows.
- ThingSpeak live data has not yet been tested for this detector.

## Recommended Use

Use `IsolationForestDetector` as a fast, general-purpose multivariate anomaly detector.

It is especially useful when:

- latency matters
- the dataset has multiple sensor columns
- the team wants a detector faster than OCSVM
- anomalies may be unusual combinations of sensor values
- the system needs a strong controlled-benchmark detector

It should not be used as the only production alerting model without further tuning. A practical future design could use Isolation Forest as a high-sensitivity detector, then combine it with other detectors or correlation-based signals before triggering dashboard alerts.

## Suggested Future Improvements

Possible improvements:

- Tune `contamination` values such as 0.01, 0.03, 0.05, 0.10, and 0.15.
- Compare runtime across larger ThingSpeak datasets.
- Add clearer feature-level explanation support.
- Test on real project ThingSpeak data.
- Use Isolation Forest as part of an ensemble with OCSVM, COPOD, ECOD, InterQuartileRangeAD, and correlation-based outputs.
- Compare official NAB scoring once NAB scoring profiles are implemented.

## Full Documentation

See the shared team documentation for full analysis, plots, and comparison results.

## References

- scikit-learn IsolationForest documentation: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html
- scikit-learn novelty and outlier detection documentation: https://scikit-learn.org/stable/modules/outlier_detection.html
- Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). Isolation Forest. IEEE International Conference on Data Mining.
- Numenta Anomaly Benchmark repository: https://github.com/numenta/NAB
