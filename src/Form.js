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

const StatelessForm = (initialState, validationRules, ...rest) => compose(

    withState('state','updateState',R.assoc('errors',{}, initialState)),
    mapProps(({updateState, state}) => ({

        //handling form states here
        form : R.prop('form',state),
        errors: R.prop('errors',state),

        //handling event handlers here
        onChange : (name,event) => {
            const value = R.path(['target', 'value'],event);
            console.log(value)
            updateState(state => {
                const updatedState = R.assocPath(['form', name],value, state);
                return R.assoc('errros',{}, updatedState)
            })
        },


        //common util for update state
        updateState : (fn) => {
            updateState(state => {
                return fn(state);
                // state.form.name = "changed";
                // return state
            })
        },

        //other props if any pass on
        others : rest
    }))
);

// helper
const getValue = R.path(['target', 'value'])

// validations
const isNotEmpty = a => a.trim().length > 0
const hasCapitalLetter = a => /[A-Z]/.test(a)
const isGreaterThan = R.curry((len, a) => (a > len))
const isLengthGreaterThan = len => R.compose(isGreaterThan(len), R.prop('length'))

const validationRules = {
    name: [
        [isNotEmpty, 'Name should not be  empty.']
    ],
    random: [
        [ isLengthGreaterThan(7), 'Minimum Random length of 8 is required.' ],
        [ hasCapitalLetter, 'Random should contain at least one uppercase letter.' ],
    ]
}
const initialState = {form: {name: 'anto', random: ''}};

const eventHandlers =  {
    click : (value) => {

    }
};
const enhanced = StatelessForm(initialState, validationRules,eventHandlers)


const dummy = (({...rest}) => {
    console.log(rest)
    const {errors , form , onChange } = rest;
    return (<div>
        <div className='formGroup'>
            <label>Name</label>
            <input
                type='text'
                value={form.name}
                onChange={onChange.bind(null,'name')}
            />
            { errors.name }
        </div>
    </div>)
})

export default enhanced(dummy)


/*
1. Handling nested validations -- may be we need to send the full form state
2. Multiple wizard -- there should be a state which says what form we are in.
3. Localization --- if we want to do localization, then we need to find a way
                    for the same.




 /*
 const enhanced = HocValidate(initialState, validationRules)
 export default enhanced(StatelessFunction)

 const StatelessFunction = ({ form, onChange, updateState,  errors = {} }) => {
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
 <button onClick={() => updateState("anto")}>Submit</button>
 </div>)
 }
 */


/*
 const HocValidate = (initialState, validationRules) => compose(
 withState('state', 'updateState', R.assoc('errors', {}, initialState)),
 mapProps(({ updateState, state, ...rest }) => ({
 onChange: R.curry((name, value) =>
 updateState(state => {
 const newState = R.assocPath(['form', name], value, state);
 const errors = R.map(ErrorComponent, getErrors(R.prop('form', newState), validationRules))
 return R.assoc('errors', errors, newState)
 })
 ),
 form: R.prop('form', state),
 errors: R.prop('errors', state),
 updateState : (tt) => {
 updateState(state => {
 console.log(state)
 state.form.name = "changed";
 return state
 })
 },
 ...rest,
 }))
 )
 */