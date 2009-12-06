describe 'NoteElement'
  before_each
    outline = elements(fixture('outline'))
    notes = outline.find('li')
    // storyboard
    // * 1: first_note
    // * 2: second_note
    //   ** 2a: child_note
    //     ** 2aI: grandchild_note 
    //   ** 2b: second_child_note
    //     *** 2bI: second_grandchild_note
    // * 3: last_note
    first_note_element             = $(notes.get(0))
    second_note_element            = $(notes.get(1))
    child_note_element             = $(notes.get(2))
    grandchild_note_element        = $(notes.get(3))
    second_child_note_element      = $(notes.get(4))
    second_grandchild_note_element = $(notes.get(5))
    last_note_element              = $(notes.get(6))

    first_note             = new NoteElement(first_note_element.find('textarea:first'))
    second_note            = new NoteElement(second_note_element.find('textarea:first'))
    child_note             = new NoteElement(child_note_element.find('textarea:first'))
    grandchild_note        = new NoteElement(grandchild_note_element.find('textarea:first'))
    second_child_note      = new NoteElement(second_child_note_element.find('textarea:first'))
    second_grandchild_note = new NoteElement(second_grandchild_note_element.find('textarea:first'))
    last_note              = new NoteElement(last_note_element.find('textarea:first'))
  end
  
  describe 'indenting'
    describe 'indent'
      before_each
        outer_context = {
          update_object: function(Type, attributes, {}, callback){
             this.update_object_attributes = attributes;
           }
        };
      end
      
      it 'should focus the current note'
        second_note.indent(outer_context);
        second_note.noteLi().attr("data-focus").should.eql 'true'
      end
      
      describe 'no previous note'
        it 'should not update anything'
          first_note.indent(outer_context);
          outer_context.update_object_attributes.should.be_null
        end

        it 'should not update anything even when there is a parent note'
          child_note.indent(outer_context);
          outer_context.update_object_attributes.should.be_null
        end

        it 'should not change the dom'
          child_note.indent(outer_context);
          second_note.nextNote().id().should.eql '3'
          child_note.parentNote().id().should.eql '2'
        end
      end
      
      describe 'previous note'
        it 'should update notes'
          second_note.indent(outer_context);
          outer_context.update_object_attributes.should.not.be_null
        end

        it 'should change the dom'
          second_note.indent(outer_context);
          second_note.parentNote().id().should.eql '1'
          first_note.nextNote().id().should.eql '3'
        end
      end
    end
    
    describe 'indentUpdateNotePointers'
      before_each
        outer_context = {
          update_object: function(Type, attributes, {}, callback){
             this.update_object_attributes = attributes;
           }
        }
      end
      
      describe 'setNextToNull'
        it 'should set my next pointer to null'
          second_note.setNextToNull(outer_context);
          outer_context.update_object_attributes.should.eql {id: '2', next_id: ''}
        end
      end
      
      describe 'setLastChildOfPreviousNoteNextPointerToMyself'
        it 'should the next pointer of the last child of my previous note to myself'
          second_child_note.setLastChildOfPreviousNoteNextPointerToMyself(outer_context);
          outer_context.update_object_attributes.should.eql {id: '2aI', next_id: '2b'}
        end
      end
      
      describe 'setNextToNullAndParentToFormerPreviousNote'
        it 'should set my next pointer to null, and my parent to my former previous note'      
          second_note.setNextToNullAndParentToFormerPreviousNote(outer_context);
          outer_context.update_object_attributes.should.eql {id: '2', next_id: '', parent_id: '1'}
        end
      end
      
      describe 'setPreviousNextPointerToNextNote'
        it 'should set the next pointer of my previous note to my current next note'       
          second_note.setPreviousNextPointerToNextNote(outer_context);
          outer_context.update_object_attributes.should.eql {id: '1', next_id: '3'}
        end
      end
      
      describe 'setPreviousNextPointerToNull'
        it 'should set the next pointer of my previous note to null'
          last_note.setPreviousNextPointerToNull(outer_context);
          outer_context.update_object_attributes.should.eql {id: '2', next_id: ''}
        end
      end
    end    

    describe 'indentNoteInDom'
      describe 'previous note has no child notes'
        before_each
          second_note.indentNoteInDom();
        end
      
        it 'should set my next note to null'
          second_note.nextNote().should.be_null
        end
      
        it 'should set my parent note to my former previous note'
          second_note.parentNote().id().should.eql '1'
        end
      
        it 'should set the next note of my former previous note to my former next note'
          first_note.nextNote().id().should.eql '3'
        end
      end
      
      describe 'previous note has child notes'
        before_each
          second_child_note.indentNoteInDom();
        end
      
        it 'should set my next note to null'
          second_child_note.nextNote().should.be_null
        end
      
        it 'should set my former parents last child as my previous note'
          grandchild_note.nextNote().id().should.eql '2b'
          second_child_note.previousNote().id().should.eql '2aI'
        end
      end
    end
  end 
  
  // describe 'unindent'
  //   describe 'setParentNextPointerToMyself'
  //     it 'should set the next pointer of my parent note to myself'       
  //       // second_note.setPreviousNextPointerToNextNote(outer_context);
  //       // outer_context.update_object_attributes.should.eql {id: '1', next_id: '3'}
  //     end
  //   end
  //   
  //   describe 'setParentToNull'
  //     it 'should my parent pointer to null'
  //       // second_note.setNextToNullAndParentToFormerPreviousNote(outer_context);
  //       // outer_context.update_object_attributes.should.eql {id: '2', next_id: '', parent_id: '1'}
  //     end
  //   end
  //   
  //   describe 'setNextTo...'
  //     it 'should set my next pointer to my '
  //       //much more stuff
  //     end
  //   end
  //   
  //   describe 'unindentNoteInDom'
  //     describe 'i have child notes and a next note'
  //       it 'should set the next note after my last child note to my next note'
  //         
  //       end
  //     end
  //   end
  // end
end
  