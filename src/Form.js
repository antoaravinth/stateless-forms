import React, {Component} from 'react'
import { compose, mapProps, withState } from 'recompose'
import * as R from 'ramda';
import Either from 'data.either'

const { Right, Left } = Either

const makePredicate = ([predFn, e]) => a => predFn(a) ? Right(a) : Left(e)
const makePredicates = R.map(makePredicate)
const runPredicates = ([input, validations]) =>
    R.map(predFn => predFn(input), makePredicates(validations))

const validate = R.map(R.compose(R.sequence(Either.of), runPredicates))
const makeValidationObject = R.mergeWithKey((k, l, r) => [l, r])
const getErrors = R.compose(validate, makeValidationObject)

const HocValidate = (initialState, validationRules) => compose(
    withState('state', 'updateState', R.assoc('errors', {}, initialState)),
    mapProps(({ updateState, state, ...rest }) => ({
        onChange: R.curry((name, value) =>
            updateState(state => {
                const newState = R.assocPath(['form', name], value, state)
                const errors = R.map(ErrorComponent, getErrors(R.prop('form', newState), validationRules))
                return R.assoc('errors', errors, newState)
            })
        ),
        form: R.prop('form', state),
        errors: R.prop('errors', state),
        ...rest,
    }))
)

// Error Component
const ErrorComponent = result =>
    result.cata({
        Right: a => null,
        Left: errorMsg => <div className='error'>{errorMsg}</div>
    })

// helper
const getValue = R.path(['target', 'value'])

// validations
const isNotEmpty = a => a.trim().length > 0
const hasCapitalLetter = a => /[A-Z]/.test(a)
const isGreaterThan = R.curry((len, a) => (a > len))
const isLengthGreaterThan = len => R.compose(isGreaterThan(len), R.prop('length'))

const StatelessFunction = ({ form, onChange, onSubmit, errors = {} }) => {
    console.log(form)
    return (<div className='form'>
        <div className='formGroup'>
            <label>Name</label>
            <input
                type='text'
                value={form.name}
                onChange={R.compose(onChange('name'), getValue)}
            />
            { errors.name }
        </div>
        <div className='formGroup'>
            <label>Random</label>
            <input
                type='text'
                value={form.random}
                onChange={R.compose(onChange('random'), getValue)}
            />
            { errors.random }
        </div>
        <button onClick={() => onSubmit(form)}>Submit</button>
    </div>)
}

const validationRules = {
    name: [
        [isNotEmpty, 'Name should not be  empty.']
    ],
    random: [
        [ isLengthGreaterThan(7), 'Minimum Random length of 8 is required.' ],
        [ hasCapitalLetter, 'Random should contain at least one uppercase letter.' ],
    ]
}
const initialState = {form: {name: '', random: ''}}

const enhanced = HocValidate(initialState, validationRules)
export default enhanced(StatelessFunction)


/*
1. Handling nested validations -- may be we need to send the full form state
2. Multiple wizard -- there should be a state which says what form we are in.
3. Localization --- if we want to do localization, then we need to find a way
                    for the same.
 */